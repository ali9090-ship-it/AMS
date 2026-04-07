from flask import Blueprint, request, jsonify
from app.models.announcement import Announcement
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.responses import ApiResponse

announcements_bp = Blueprint('announcements', __name__)

@announcements_bp.route('', methods=['GET'])
@token_required
def get_announcements(current_user):
    # Rule A5: Teacher announcements -> students ONLY. Admin announcements -> BOTH.
    if current_user.role == 'student':
        # Student sees everything (from Admin and Teacher)
        announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    elif current_user.role == 'teacher':
        # Teacher sees ONLY Admin announcements (and maybe their own for management)
        # Assuming posted_by matches role
        from app.models.user import User
        announcements = Announcement.query.join(User, Announcement.posted_by == User.id)\
            .filter((User.role == 'admin') | (Announcement.posted_by == current_user.id))\
            .order_by(Announcement.created_at.desc()).all()
    else: # admin
        announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
        
    return ApiResponse.success([a.to_dict() for a in announcements])

@announcements_bp.route('', methods=['POST'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def post_announcement(current_user):
    data = request.get_json()
    
    try:
        announcement = Announcement(
            title=data.get('title'),
            content=data.get('body') or data.get('content'),
            type=data.get('type', 'General'),
            target_role=data.get('target_role', 'all'),
            posted_by=current_user.id
        )
        
        db.session.add(announcement)
        db.session.commit()
        return ApiResponse.success(announcement.to_dict(), status=201)
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@announcements_bp.route('/<int:id>', methods=['DELETE'])
@token_required
@role_required(["ADMIN"])
def delete_announcement(current_user, id):
    announcement = Announcement.query.get_or_404(id)
    db.session.delete(announcement)
    db.session.commit()
    return ApiResponse.success(message="Announcement deleted")

@announcements_bp.route('/<int:id>', methods=['PUT'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def update_announcement(current_user, id):
    announcement = Announcement.query.get_or_404(id)
    
    if current_user.role == 'teacher' and announcement.posted_by != current_user.id:
        return ApiResponse.error("UNAUTHORIZED", "You can only edit your own announcements", status=403)
        
    data = request.get_json()
    try:
        if 'title' in data: announcement.title = data['title']
        if 'content' in data: announcement.content = data['content']
        elif 'body' in data: announcement.content = data['body']
        if 'type' in data: announcement.type = data['type']
        if 'target_role' in data: announcement.target_role = data['target_role']
        
        db.session.commit()
        return ApiResponse.success(announcement.to_dict())
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))
