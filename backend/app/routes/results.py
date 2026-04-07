from flask import Blueprint, request, jsonify
from app.models.result import Result
from app.models.course import Course, CourseEnrollment, TeacherCourse
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.responses import ApiResponse
from app.utils.risk import update_student_risk_score
from sqlalchemy.exc import IntegrityError
from collections import defaultdict

results_bp = Blueprint('results', __name__)

def get_grade(p):
    if p >= 90: return 'A+', 10.0
    if p >= 80: return 'A', 9.0
    if p >= 70: return 'B+', 8.0
    if p >= 60: return 'B', 7.0
    if p >= 50: return 'C', 6.0
    if p >= 40: return 'D', 5.0
    return 'F', 0.0

@results_bp.route('/my', methods=['GET'])
@token_required
@role_required(["STUDENT"])
def get_my_results(current_user):
    records = Result.query.filter_by(student_id=current_user.id).all()
    
    # Group by semester for SGPA calculation
    by_semester = defaultdict(list)
    for r in records:
        by_semester[r.semester].append(r)
    
    semesters = {}
    all_gp_credits = []
    
    for sem, results in sorted(by_semester.items()):
        total_credits = 0
        weighted_gp = 0
        for r in results:
            credits = r.course.credits if r.course else 4
            total_credits += credits
            weighted_gp += (r.grade_point or 0) * credits
            all_gp_credits.append((r.grade_point or 0, credits))
        
        sgpa = round(weighted_gp / total_credits, 2) if total_credits > 0 else 0
        semesters[sem] = {
            'semester': sem,
            'sgpa': sgpa,
            'results': [r.to_dict() for r in results]
        }
    
    # Calculate CGPA
    total_credits = sum(c for _, c in all_gp_credits)
    total_weighted = sum(gp * c for gp, c in all_gp_credits)
    cgpa = round(total_weighted / total_credits, 2) if total_credits > 0 else 0
    
    return ApiResponse.success({
        'records': [r.to_dict() for r in records],
        'semesters': semesters,
        'cgpa': cgpa
    })

@results_bp.route('/course/<int:course_id>', methods=['GET'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def get_course_results(current_user, course_id):
    if current_user.role == 'teacher':
        assigned = TeacherCourse.query.filter_by(teacher_id=current_user.id, course_id=course_id).first()
        primary = Course.query.filter_by(id=course_id, teacher_id=current_user.id).first()
        if not (assigned or primary):
            return ApiResponse.unauthorized("You are not assigned to this course")

    records = Result.query.filter_by(course_id=course_id).all()
    return ApiResponse.success([r.to_dict() for r in records])

@results_bp.route('/add', methods=['POST'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def add_result(current_user):
    data = request.get_json()
    course_id = data.get('course_id')
    student_id = data.get('student_id')
    
    if current_user.role == 'teacher':
        assigned = TeacherCourse.query.filter_by(teacher_id=current_user.id, course_id=course_id).first()
        primary = Course.query.filter_by(id=course_id, teacher_id=current_user.id).first()
        if not (assigned or primary):
            return ApiResponse.unauthorized("You are not assigned to this course")

    try:
        mo = float(data.get('marks_obtained', 0))
        tm = float(data.get('total_marks', 100))
        
        if tm == 0:
            return ApiResponse.error("VALIDATION_ERROR", "total_marks cannot be zero")
            
        grade, gp = get_grade(mo / tm * 100)
        
        # Check if result already exists for this student/course/exam_type
        existing = Result.query.filter_by(
            student_id=student_id,
            course_id=course_id,
            exam_type=data.get('exam_type')
        ).first()
        
        if existing:
            # Update existing
            existing.marks_obtained = mo
            existing.total_marks = tm
            existing.grade = grade
            existing.grade_point = gp
            if 'semester' in data:
                existing.semester = data['semester']
            db.session.commit()
            update_student_risk_score(student_id)
            return ApiResponse.success(existing.to_dict())
        
        result = Result(
            student_id=student_id,
            course_id=course_id,
            semester=data.get('semester'),
            exam_type=data.get('exam_type'),
            marks_obtained=mo,
            total_marks=tm,
            grade=grade,
            grade_point=gp
        )
        db.session.add(result)
        db.session.commit()
        
        update_student_risk_score(student_id)
        return ApiResponse.success(result.to_dict(), status=201)
    except IntegrityError:
        db.session.rollback()
        return ApiResponse.error("DUPLICATE_ENTRY", "This result record already exists", status=409)
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@results_bp.route('/<int:id>', methods=['PUT'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def update_result(current_user, id):
    result = Result.query.get_or_404(id)
    
    if current_user.role == 'teacher':
        assigned = TeacherCourse.query.filter_by(teacher_id=current_user.id, course_id=result.course_id).first()
        primary = Course.query.filter_by(id=result.course_id, teacher_id=current_user.id).first()
        if not (assigned or primary):
            return ApiResponse.unauthorized("You cannot update results for this course")

    data = request.get_json()

    try:
        if 'marks_obtained' in data: result.marks_obtained = float(data['marks_obtained'])
        if 'total_marks' in data: result.total_marks = float(data['total_marks'])
        if 'semester' in data: result.semester = data['semester']
        if 'exam_type' in data: result.exam_type = data['exam_type']
        
        result.grade, result.grade_point = get_grade(result.marks_obtained / result.total_marks * 100)
        db.session.commit()
        
        update_student_risk_score(result.student_id)
        return ApiResponse.success(result.to_dict())
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@results_bp.route('/<int:id>', methods=['DELETE'])
@token_required
@role_required(["ADMIN"])
def delete_result(current_user, id):
    result = Result.query.get_or_404(id)
    try:
        db.session.delete(result)
        db.session.commit()
        return ApiResponse.success(message="Result deleted")
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("INTERNAL_ERROR", str(e))
