from flask import Blueprint, request, jsonify
import datetime
from app.models.attendance import Attendance
from app.models.course import Course, CourseEnrollment, TeacherCourse
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.responses import ApiResponse
from app.utils.risk import update_student_risk_score
from sqlalchemy.exc import IntegrityError

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/my', methods=['GET'])
@token_required
@role_required(["STUDENT"])
def get_my_attendance(current_user):
    records = Attendance.query.filter_by(student_id=current_user.id).order_by(Attendance.date.desc()).all()
    
    # Build per-course summary
    course_stats = {}
    for r in records:
        cid = r.course_id
        if cid not in course_stats:
            course_stats[cid] = {
                'course_id': cid,
                'course_name': r.course.name if r.course else 'Unknown',
                'course_code': r.course.code if r.course else None,
                'present_count': 0,
                'total_count': 0
            }
        course_stats[cid]['total_count'] += 1
        if r.status == 'Present' or r.status == 'Late':
            course_stats[cid]['present_count'] += 1
    
    for cid in course_stats:
        total = course_stats[cid]['total_count']
        present = course_stats[cid]['present_count']
        course_stats[cid]['percentage'] = round(present / total * 100, 1) if total > 0 else 0
    
    return ApiResponse.success({
        'records': [r.to_dict() for r in records],
        'summary': list(course_stats.values())
    })

@attendance_bp.route('/course/<int:course_id>', methods=['GET'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def get_course_attendance(current_user, course_id):
    if current_user.role == 'teacher':
        assigned = TeacherCourse.query.filter_by(teacher_id=current_user.id, course_id=course_id).first()
        primary = Course.query.filter_by(id=course_id, teacher_id=current_user.id).first()
        if not (assigned or primary):
            return ApiResponse.unauthorized("You are not assigned to this course")

    records = Attendance.query.filter_by(course_id=course_id).order_by(Attendance.date.desc()).all()
    return ApiResponse.success([r.to_dict() for r in records])

@attendance_bp.route('/mark', methods=['POST'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def mark_attendance(current_user):
    data = request.get_json()
    course_id = data.get('course_id')
    date_str = data.get('date')
    students = data.get('students') or data.get('records')
    
    if not course_id or not date_str or not students:
        return ApiResponse.error("VALIDATION_ERROR", "Missing data")
        
    if current_user.role == 'teacher':
        assigned = TeacherCourse.query.filter_by(teacher_id=current_user.id, course_id=course_id).first()
        primary = Course.query.filter_by(id=course_id, teacher_id=current_user.id).first()
        if not (assigned or primary):
            return ApiResponse.error("FORBIDDEN", "You can only mark attendance for your own courses", status=403)
            
    try:
        date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        
        count = 0
        with db.session.begin_nested():
            for s in students:
                sid = s.get('student_id')
                status = s.get('status')
                
                # Upsert: update if exists, insert if not
                existing = Attendance.query.filter_by(
                    student_id=sid, course_id=course_id, date=date_obj
                ).first()
                
                if existing:
                    existing.status = status
                    existing.marked_by = current_user.id
                else:
                    record = Attendance(
                        student_id=sid,
                        course_id=course_id,
                        date=date_obj,
                        status=status,
                        marked_by=current_user.id
                    )
                    db.session.add(record)
                count += 1
        db.session.commit()
                
        # Immediate risk recalculation
        for s in students:
            update_student_risk_score(s.get('student_id'))
            
        return ApiResponse.success({"count": count}, message=f"Attendance saved for {count} students")
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@attendance_bp.route('/<int:id>', methods=['PUT'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def update_attendance(current_user, id):
    record = Attendance.query.get_or_404(id)
    
    if current_user.role == 'teacher':
        assigned = TeacherCourse.query.filter_by(teacher_id=current_user.id, course_id=record.course_id).first()
        if not assigned:
            return ApiResponse.unauthorized("You cannot update attendance for this course")

    data = request.get_json()
    if 'status' in data:
        record.status = data['status']
    db.session.commit()
    
    update_student_risk_score(record.student_id)
    return ApiResponse.success(record.to_dict())
