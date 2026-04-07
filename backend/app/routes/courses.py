from flask import Blueprint, request, jsonify
from app.models.course import Course, CourseEnrollment, TeacherCourse
from app.models.user import User
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.responses import ApiResponse

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('', methods=['GET'])
@token_required
def get_courses(current_user):
    if current_user.role == 'admin':
        courses = Course.query.all()
    elif current_user.role == 'teacher':
        assignments = TeacherCourse.query.filter_by(teacher_id=current_user.id).all()
        course_ids = [a.course_id for a in assignments]
        courses = Course.query.filter((Course.id.in_(course_ids)) | (Course.teacher_id == current_user.id)).all()
    else:  # student
        enrollments = CourseEnrollment.query.filter_by(student_id=current_user.id).all()
        courses = [e.course for e in enrollments]
        
    return ApiResponse.success([c.to_dict() for c in courses])

@courses_bp.route('', methods=['POST'])
@token_required
@role_required(["ADMIN"])
def create_course(current_user):
    data = request.get_json()
    
    if Course.query.filter_by(code=data.get('code')).first():
        return ApiResponse.conflict("Course code already exists")
        
    try:
        course = Course(
            name=data.get('name'),
            code=data.get('code'),
            teacher_id=data.get('teacher_id'),
            branch=data.get('branch'),
            semester=data.get('semester'),
            credits=data.get('credits', 4),
            schedule=data.get('schedule')
        )
        db.session.add(course)
        db.session.flush() # Get ID
        
        if course.teacher_id:
            assignment = TeacherCourse(teacher_id=course.teacher_id, course_id=course.id)
            db.session.add(assignment)
            
        db.session.commit()
        return ApiResponse.success(course.to_dict(), status=201)
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@courses_bp.route('/<int:id>', methods=['PUT'])
@token_required
@role_required(["ADMIN"])
def update_course(current_user, id):
    course = Course.query.get_or_404(id)
    data = request.get_json()
    
    try:
        if 'name' in data: course.name = data['name']
        if 'code' in data: 
            existing = Course.query.filter_by(code=data['code']).first()
            if existing and existing.id != id:
                return ApiResponse.conflict("Course code already exists")
            course.code = data['code']
        if 'teacher_id' in data: 
            course.teacher_id = data['teacher_id']
            # Sync TeacherCourse
            if not TeacherCourse.query.filter_by(teacher_id=course.teacher_id, course_id=course.id).first():
                db.session.add(TeacherCourse(teacher_id=course.teacher_id, course_id=course.id))
                
        if 'branch' in data: course.branch = data['branch']
        if 'semester' in data: course.semester = data['semester']
        if 'credits' in data: course.credits = data['credits']
        if 'schedule' in data: course.schedule = data['schedule']
        
        db.session.commit()
        return ApiResponse.success(course.to_dict())
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@courses_bp.route('/<int:id>', methods=['DELETE'])
@token_required
@role_required(["ADMIN"])
def delete_course(current_user, id):
    course = Course.query.get_or_404(id)
    try:
        CourseEnrollment.query.filter_by(course_id=id).delete()
        db.session.delete(course)
        db.session.commit()
        return ApiResponse.success(message="Course deleted")
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@courses_bp.route('/<int:id>/enroll', methods=['POST'])
@token_required
@role_required(["ADMIN"])
def enroll_student(current_user, id):
    course = Course.query.get_or_404(id)
    data = request.get_json()
    student_id = data.get('student_id')
    
    if not student_id:
        return ApiResponse.error("VALIDATION_ERROR", "student_id is required")
        
    # check if student exists and is not inactive
    student = User.query.filter_by(id=student_id, role='student', deleted_at=None).filter(User.status != 'Inactive').first()
    if not student:
        return ApiResponse.error("NOT_FOUND", "Student not found or inactive", status=404)
        
    existing = CourseEnrollment.query.filter_by(student_id=student_id, course_id=id).first()
    if existing:
        return ApiResponse.conflict("Student already enrolled")
        
    try:
        enrollment = CourseEnrollment(student_id=student_id, course_id=id)
        db.session.add(enrollment)
        db.session.commit()
        return ApiResponse.success(message="Enrolled successfully")
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@courses_bp.route('/<int:id>/enroll/<int:student_id>', methods=['DELETE'])
@token_required
@role_required(["ADMIN"])
def unenroll_student(current_user, id, student_id):
    enrollment = CourseEnrollment.query.filter_by(course_id=id, student_id=student_id).first_or_404()
    try:
        db.session.delete(enrollment)
        db.session.commit()
        return ApiResponse.success(message="Student removed from course")
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@courses_bp.route('/<int:id>/enroll-bulk', methods=['POST'])
@token_required
@role_required(["ADMIN"])
def enroll_students_bulk(current_user, id):
    course = Course.query.get_or_404(id)
    data = request.get_json()
    student_ids = data.get('student_ids', [])
    
    if not student_ids:
        return ApiResponse.error("VALIDATION_ERROR", "No student IDs provided")
        
    try:
        with db.session.begin_nested():
            enrolled_count = 0
            skipped_duplicates = 0
            for sid in student_ids:
                # Check if student exists and is not inactive
                student = User.query.filter_by(id=sid, role='student', deleted_at=None).filter(User.status != 'Inactive').first()
                if not student:
                    raise Exception(f"Student ID {sid} not found or inactive")
                
                existing = CourseEnrollment.query.filter_by(student_id=sid, course_id=id).first()
                if existing:
                    skipped_duplicates += 1
                    continue
                
                enrollment = CourseEnrollment(student_id=sid, course_id=id)
                db.session.add(enrollment)
                enrolled_count += 1
        db.session.commit()
                
        return ApiResponse.success({
            "enrolled_count": enrolled_count,
            "skipped_duplicates": skipped_duplicates
        }, message=f"Successfully enrolled {enrolled_count} students ({skipped_duplicates} skipped)")
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("BULK_ERROR", str(e), status=400)

@courses_bp.route('/<int:id>/students', methods=['GET'])
@token_required
@role_required(["ADMIN", "TEACHER"])
def get_course_students(current_user, id):
    course = Course.query.get_or_404(id)
    enrollments = CourseEnrollment.query.filter_by(course_id=id).all()
    student_ids = [e.student_id for e in enrollments]
    students = User.query.filter(User.id.in_(student_ids), User.deleted_at == None).all()
    return ApiResponse.success([s.to_dict() for s in students])
