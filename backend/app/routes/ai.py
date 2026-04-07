from flask import Blueprint, request, jsonify, current_app
from app.models.user import User
from app.models.attendance import Attendance
from app.models.result import Result
from app.models.course import Course, CourseEnrollment, TeacherCourse
from app.middleware.auth import token_required, role_required
from app.database import db
from app.utils.responses import ApiResponse
from sqlalchemy import func
import re

ai_bp = Blueprint('ai', __name__)

def calculate_risk_score(student_id):
    """Calculate risk score using the exact formula from spec."""
    risk = 0
    
    # Attendance risk
    total_classes = Attendance.query.filter_by(student_id=student_id).count()
    present_classes = Attendance.query.filter_by(student_id=student_id, status='Present').count()
    attendance_pct = (present_classes / total_classes * 100) if total_classes > 0 else 100
    
    attendance_risk = 0
    if attendance_pct < 75:
        attendance_risk += 40
    if attendance_pct < 65:
        attendance_risk += 20
    
    # Marks risk
    results = Result.query.filter_by(student_id=student_id).all()
    if results:
        avg_marks_pct = sum((r.marks_obtained / r.total_marks * 100) for r in results) / len(results)
    else:
        avg_marks_pct = 100
    
    marks_risk = 0
    if avg_marks_pct < 40:
        marks_risk += 40
    if avg_marks_pct < 30:
        marks_risk += 20
    
    risk = min(attendance_risk + marks_risk, 100)
    
    if risk >= 75:
        risk_level = "HIGH"
    elif risk >= 50:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    return {
        'risk_score': risk,
        'risk_level': risk_level,
        'attendance_percentage': round(attendance_pct, 1),
        'average_marks_percentage': round(avg_marks_pct, 1),
        'breakdown': {
            'attendance_risk': attendance_risk,
            'marks_risk': marks_risk
        }
    }

@ai_bp.route('/risk-score/<int:student_id>', methods=['GET'])
@token_required
@role_required(["ADMIN", "TEACHER"])
def get_risk_score(current_user, student_id):
    student = User.query.filter_by(id=student_id, role='student').first()
    if not student:
        return ApiResponse.error("NOT_FOUND", "Student not found", status=404)
    
    score_data = calculate_risk_score(student_id)
    score_data['student_id'] = student.id
    score_data['student_name'] = student.name
    
    return ApiResponse.success(score_data)

@ai_bp.route('/at-risk-students', methods=['GET'])
@token_required
@role_required(["ADMIN", "TEACHER"])
def get_at_risk_students(current_user):
    # Get relevant students
    if current_user.role == 'teacher':
        assignments = TeacherCourse.query.filter_by(teacher_id=current_user.id).all()
        course_ids = [a.course_id for a in assignments]
        # Also include courses where teacher_id matches
        primary_courses = Course.query.filter_by(teacher_id=current_user.id).all()
        course_ids = list(set(course_ids + [c.id for c in primary_courses]))
        
        enrollments = CourseEnrollment.query.filter(CourseEnrollment.course_id.in_(course_ids)).all()
        student_ids = list(set([e.student_id for e in enrollments]))
        students = User.query.filter(User.id.in_(student_ids), User.deleted_at == None, User.role == 'student').all()
    else:
        students = User.query.filter_by(role='student', deleted_at=None).all()

    at_risk = []
    for s in students:
        score_data = calculate_risk_score(s.id)
        if score_data['risk_score'] >= 50:
            at_risk.append({
                'student_id': s.id,
                'name': s.name,
                'roll_no': s.roll_no,
                'branch': s.branch,
                **score_data
            })
    
    at_risk.sort(key=lambda x: x['risk_score'], reverse=True)
    return ApiResponse.success(at_risk)

@ai_bp.route('/risk-scoring', methods=['GET'])
@token_required
@role_required(["ADMIN", "TEACHER"])
def get_risk_scoring(current_user):
    """Legacy endpoint - kept for backwards compatibility."""
    if current_user.role == 'teacher':
        assignments = TeacherCourse.query.filter_by(teacher_id=current_user.id).all()
        course_ids = [a.course_id for a in assignments]
        enrollments = CourseEnrollment.query.filter(CourseEnrollment.course_id.in_(course_ids)).all()
        student_ids = list(set([e.student_id for e in enrollments]))
        students = User.query.filter(User.id.in_(student_ids), User.deleted_at == None).all()
    else:
        students = User.query.filter_by(role='student', deleted_at=None).all()

    res = []
    for s in students:
        score_data = calculate_risk_score(s.id)
        res.append({
            'student_id': s.id,
            'name': s.name,
            'roll_no': s.roll_no,
            'attendance': score_data['attendance_percentage'],
            'marks': score_data['average_marks_percentage'],
            'risk_level': score_data['risk_level'],
            'risk_score': score_data['risk_score']
        })
    return ApiResponse.success(res)

@ai_bp.route('/scholarship-eligibility', methods=['GET'])
@token_required
@role_required(["STUDENT"])
def check_all_eligibility(current_user):
    """Check current student's eligibility for all scholarships."""
    from app.models.scholarship import Scholarship
    
    # Calculate student's approximate SGPA
    results = Result.query.filter_by(student_id=current_user.id).all()
    if results:
        # Simple SGPA: average of grade points
        sgpa = sum(r.grade_point for r in results if r.grade_point) / len(results)
    else:
        sgpa = 0
    
    scholarships = Scholarship.query.all()
    eligibility = []
    
    for s in scholarships:
        is_eligible = True
        reason = f"Your estimated SGPA: {round(sgpa, 1)}"
        
        criteria_text = (s.criteria or '').lower()
        
        # Check for SGPA/GPA requirement in criteria text
        sgpa_match = re.search(r'(?:sgpa|gpa|cgpa)\s*(?:>=?|above|of|minimum)?\s*(\d+\.?\d*)', criteria_text)
        if sgpa_match:
            required_sgpa = float(sgpa_match.group(1))
            if sgpa >= required_sgpa:
                is_eligible = True
                reason = f"Your SGPA {round(sgpa, 1)} meets requirement of {required_sgpa}"
            else:
                is_eligible = False
                reason = f"Your SGPA {round(sgpa, 1)} does not meet requirement of {required_sgpa}"
        
        eligibility.append({
            'scholarship_id': s.id,
            'scholarship_name': s.name,
            'amount': float(s.amount) if s.amount else None,
            'eligible': is_eligible,
            'reason': reason
        })
    
    return ApiResponse.success(eligibility)

@ai_bp.route('/scholarship-eligibility/<int:scholarship_id>', methods=['GET'])
@token_required
@role_required(["STUDENT"])
def check_single_eligibility(current_user, scholarship_id):
    """Legacy endpoint for checking single scholarship eligibility."""
    from app.models.scholarship import Scholarship
    s = Scholarship.query.get_or_404(scholarship_id)
    
    results = Result.query.filter_by(student_id=current_user.id).all()
    sgpa = sum(r.grade_point for r in results if r.grade_point) / len(results) if results else 0
    
    is_eligible = True
    reason = "Meets basic criteria"
    
    criteria_text = (s.criteria or '').lower()
    sgpa_match = re.search(r'(?:sgpa|gpa|cgpa)\s*(?:>=?|above|of|minimum)?\s*(\d+\.?\d*)', criteria_text)
    if sgpa_match:
        required = float(sgpa_match.group(1))
        if sgpa >= required:
            reason = f"Your SGPA {round(sgpa, 1)} meets requirement of {required}"
        else:
            is_eligible = False
            reason = f"Your SGPA {round(sgpa, 1)} does not meet requirement of {required}"
    
    return ApiResponse.success({
        'is_eligible': is_eligible,
        'reason': reason
    })
