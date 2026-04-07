from flask import Blueprint, request, jsonify
from app.models.feedback import Feedback
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.responses import ApiResponse

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('', methods=['POST'])
@token_required
@role_required(["STUDENT"])
def submit_feedback(current_user):
    data = request.get_json()
    is_anon = data.get('is_anonymous', False)
    
    # Map 'message' to 'comment' if needed for frontend compatibility, but prefer 'comment'
    comment = data.get('comment') or data.get('message')
    rating = data.get('rating', 5) # Default to 5 if not provided
    
    try:
        feedback = Feedback(
            student_id=None if is_anon else current_user.id,
            course_id=data.get('course_id'),
            rating=rating,
            comment=comment,
            is_anonymous=is_anon
        )
        db.session.add(feedback)
        db.session.commit()
        return ApiResponse.success(feedback.to_dict(), status=201)
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@feedback_bp.route('', methods=['GET'])
@token_required
@role_required(["ADMIN"])
def get_all_feedback(current_user):
    fb = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return ApiResponse.success([f.to_dict() for f in fb])

@feedback_bp.route('/my', methods=['GET'])
@token_required
@role_required(["TEACHER"])
def get_my_feedback(current_user):
    from app.models.course import Course
    # Get all courses taught by this teacher
    courses = Course.query.filter_by(teacher_id=current_user.id).all()
    course_ids = [c.id for c in courses]
    
    fb = Feedback.query.filter(Feedback.course_id.in_(course_ids)).order_by(Feedback.created_at.desc()).all()
    return ApiResponse.success([f.to_dict() for f in fb])

@feedback_bp.route('/stats', methods=['GET'])
@token_required
@role_required(["ADMIN"])
def get_feedback_stats(current_user):
    # Simplified stats: group by course or general categories if we had them
    total = Feedback.query.count()
    if total == 0:
        return ApiResponse.success([])
        
    pos = Feedback.query.filter(Feedback.rating >= 4).count()
    neu = Feedback.query.filter(Feedback.rating == 3).count()
    neg = Feedback.query.filter(Feedback.rating <= 2).count()
    
    return ApiResponse.success([
        {"category": "Overall Course Quality", "positive": round(pos/total*100), "neutral": round(neu/total*100), "negative": round(neg/total*100)},
        {"category": "Teaching Effectiveness", "positive": round(pos/total*100), "neutral": round(neu/total*100), "negative": round(neg/total*100)}, 
    ])

@feedback_bp.route('/course/<int:course_id>', methods=['GET'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def get_course_feedback(current_user, course_id):
    fb = Feedback.query.filter_by(course_id=course_id).order_by(Feedback.created_at.desc()).all()
    return ApiResponse.success([f.to_dict() for f in fb])
