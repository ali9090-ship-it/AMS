from flask import Blueprint, request, jsonify
from app.models.exam_schedule import ExamSchedule
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.responses import ApiResponse

exams_bp = Blueprint('exams', __name__)

@exams_bp.route('/schedules', methods=['GET'])
@token_required
def get_exam_schedules(current_user):
    schedules = ExamSchedule.query.order_by(ExamSchedule.exam_date.asc()).all()
    return ApiResponse.success([s.to_dict() for s in schedules])

@exams_bp.route('/schedules', methods=['POST'])
@token_required
@role_required(["ADMIN"])
def create_exam_schedule(current_user):
    data = request.get_json()
    
    try:
        schedule = ExamSchedule(
            name=data.get('name'),
            subject=data.get('subject'),
            course_id=data.get('course_id'),
            exam_date=data.get('exam_date'),
            start_time=data.get('start_time'),
            room=data.get('room'),
            status=data.get('status', 'Scheduled'),
            created_by=current_user.id
        )
        
        db.session.add(schedule)
        db.session.commit()
        return ApiResponse.success(schedule.to_dict(), status=201)
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@exams_bp.route('/schedules/<int:id>', methods=['PUT'])
@token_required
@role_required(["ADMIN"])
def update_exam_schedule(current_user, id):
    schedule = ExamSchedule.query.get_or_404(id)
    data = request.get_json()
    
    try:
        if 'name' in data: schedule.name = data['name']
        if 'subject' in data: schedule.subject = data['subject']
        if 'course_id' in data: schedule.course_id = data['course_id']
        if 'exam_date' in data: schedule.exam_date = data['exam_date']
        if 'start_time' in data: schedule.start_time = data['start_time']
        if 'room' in data: schedule.room = data['room']
        if 'status' in data: schedule.status = data['status']
        
        db.session.commit()
        return ApiResponse.success(schedule.to_dict())
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@exams_bp.route('/schedules/<int:id>', methods=['DELETE'])
@token_required
@role_required(["ADMIN"])
def delete_exam_schedule(current_user, id):
    schedule = ExamSchedule.query.get_or_404(id)
    try:
        db.session.delete(schedule)
        db.session.commit()
        return ApiResponse.success(message="Exam schedule deleted")
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))
