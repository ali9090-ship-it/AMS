import bcrypt
import re
from flask import Blueprint, request, jsonify
from app.models.user import User
from app.models.attendance import Attendance
from app.models.result import Result
from app.models.course import CourseEnrollment
from app.models.placement import PlacementApplication
from app.models.scholarship import ScholarshipApplication
from app.models.feedback import Feedback
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.responses import ApiResponse
from app.utils.files import save_file, delete_file
from sqlalchemy.exc import IntegrityError
from datetime import datetime

users_bp = Blueprint('users', __name__)

VALID_ROLES = {'student', 'teacher', 'admin'}

@users_bp.route('/bulk', methods=['POST'])
@token_required
@role_required(["ADMIN"])
def bulk_create_users(current_user):
    data = request.get_json()
    users_data = data.get('users', [])
    
    if not users_data or not isinstance(users_data, list):
        return ApiResponse.error("VALIDATION_ERROR", "Provide a non-empty 'users' array")
    
    # === PRE-VALIDATION PASS (no DB writes) ===
    seen_emails = set()
    for i, row in enumerate(users_data, start=1):
        name = (row.get('name') or '').strip()
        email = (row.get('email') or '').lower().strip()
        role = (row.get('role') or '').lower().strip()
        branch = (row.get('branch') or '').strip()
        
        if not name:
            return ApiResponse.error("VALIDATION_ERROR", f"Validation failed on row {i}: name is required", status=400)
        if not email:
            return ApiResponse.error("VALIDATION_ERROR", f"Validation failed on row {i}: email is required", status=400)
        if not role:
            return ApiResponse.error("VALIDATION_ERROR", f"Validation failed on row {i}: role is required", status=400)
        if role not in VALID_ROLES:
            return ApiResponse.error("VALIDATION_ERROR", f"Validation failed on row {i}: role must be student, teacher, or admin", status=400)
        if role == 'student' and not branch:
            return ApiResponse.error("VALIDATION_ERROR", f"Validation failed on row {i}: branch is required for students", status=400)
        
        # Duplicate within payload
        if email in seen_emails:
            return ApiResponse.error("VALIDATION_ERROR", f"Validation failed on row {i}: duplicate email '{email}' in payload", status=400)
        seen_emails.add(email)
        
        # Duplicate against DB
        if User.query.filter_by(email=email).first():
            return ApiResponse.error("VALIDATION_ERROR", f"Validation failed on row {i}: email '{email}' already exists in database", status=409)
    
    # === ATOMIC INSERT ===
    try:
        with db.session.begin_nested():
            for row in users_data:
                password = row.get('password', 'default123')
                hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                user = User(
                    name=row.get('name', '').strip(),
                    email=row.get('email', '').lower().strip(),
                    password=hashed_pw,
                    role=row.get('role', '').lower().strip(),
                    branch=row.get('branch', '').strip(),
                    roll_no=row.get('roll_no', '').strip() if row.get('roll_no') else None,
                    status=row.get('status', 'Pending')
                )
                db.session.add(user)
        db.session.commit()
        return ApiResponse.success({"created_count": len(users_data)}, message=f"Successfully created {len(users_data)} users")
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("BULK_ERROR", str(e), status=400)

@users_bp.route('', methods=['GET'])
@token_required
@role_required(["ADMIN", "TEACHER"])
def get_users(current_user):
    role = request.args.get('role')
    branch = request.args.get('branch')
    status = request.args.get('status')
    
    # Bug 3 - If teacher, force role to student
    if current_user.role == 'teacher':
        role = 'student'
        
    query = User.query.filter(User.deleted_at == None)
    if role:
        query = query.filter_by(role=role)
    if branch:
        query = query.filter_by(branch=branch)
    if status:
        query = query.filter_by(status=status)
        
    users = query.all()
    return ApiResponse.success([u.to_dict() for u in users])


@users_bp.route('', methods=['POST'])
@token_required
@role_required(["ADMIN"])
def create_user(current_user):
    data = request.get_json()
    
    # Check if email exists
    if User.query.filter_by(email=data.get('email')).first():
        return ApiResponse.error("DUPLICATE_EMAIL", "Email already exists", status=409)
        
    hashed_pw = bcrypt.hashpw(data.get('password', 'default123').encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        with db.session.begin_nested():
            new_user = User(
                name=data.get('name'),
                email=data.get('email'),
                password=hashed_pw,
                role=data.get('role'),
                branch=data.get('branch'),
                roll_no=data.get('roll_no'),
                phone=data.get('phone'),
                status=data.get('status', 'Pending')
            )
            db.session.add(new_user)
        db.session.commit()
        return ApiResponse.success(new_user.to_dict(), status=201)
    except IntegrityError:
        return ApiResponse.error("DUPLICATE_ENTRY", "Record already exists", status=409)
    except Exception as e:
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@users_bp.route('/<int:id>', methods=['PUT'])
@token_required
@role_required(["ADMIN"])
def update_user(current_user, id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    try:
        if 'name' in data: user.name = data['name']
        if 'email' in data: 
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != id:
                return ApiResponse.error("DUPLICATE_EMAIL", "Email already exists", status=409)
            user.email = data['email']
        if 'role' in data: user.role = data['role']
        if 'branch' in data: user.branch = data['branch']
        if 'roll_no' in data: user.roll_no = data['roll_no']
        if 'phone' in data: user.phone = data['phone']
        if 'status' in data: user.status = data['status']

        
        with db.session.begin_nested():
            db.session.add(user)
        db.session.commit()
        return ApiResponse.success(user.to_dict())
    except Exception as e:
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@users_bp.route('/<int:id>', methods=['DELETE'])
@token_required
@role_required(["ADMIN"])
def delete_user(current_user, id):
    user = User.query.get_or_404(id)
    try:
        with db.session.begin_nested():
            user.deleted_at = datetime.utcnow()
            user.status = 'Inactive'
            db.session.add(user)
        db.session.commit()
        return ApiResponse.success(message="User marked as deleted (Safe Delete). History preserved.")
    except Exception as e:
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@users_bp.route('/me/avatar', methods=['PUT'])
@token_required
def upload_avatar(current_user):
    if 'file' not in request.files:
        return ApiResponse.error("VALIDATION_ERROR", "No file part")
        
    file = request.files['file']
    if file.filename == '':
        return ApiResponse.error("VALIDATION_ERROR", "No selected file")
        
    relative_path = None
    try:
        old_avatar = current_user.avatar
        relative_path = save_file(file, 'avatars')
        with db.session.begin_nested():
            current_user.avatar = relative_path
            db.session.add(current_user)
        
        if old_avatar:
            delete_file(old_avatar)
        return ApiResponse.success({'avatar': relative_path}, "Avatar updated")
    except Exception as e:
        if relative_path:
            delete_file(relative_path)
        return ApiResponse.error("INTERNAL_ERROR", str(e))



@users_bp.route('/me', methods=['PUT'])
@token_required
def update_me(current_user):
    data = request.get_json()
    try:
        if 'name' in data: current_user.name = data['name']
        if 'phone' in data: current_user.phone = data['phone']
        with db.session.begin():
            db.session.add(current_user)
        return ApiResponse.success(current_user.to_dict())
    except Exception as e:
        return ApiResponse.error("INTERNAL_ERROR", str(e))
