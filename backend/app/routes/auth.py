import jwt
import bcrypt
import datetime
import re
from flask import Blueprint, request, jsonify, current_app
from app.utils.responses import ApiResponse
from app.models.user import User
from app.database import db
from app.middleware.auth import token_required
from app.limiter import limiter
from flask_limiter.util import get_remote_address

auth_bp = Blueprint('auth', __name__)

# Strict Email Regex Rules (expanded branches)
STUDENT_REGEX = re.compile(r"^[a-z]+\.[a-z0-9]+\.(cs|ce|it|cse|aiml|extc|mech|civil)@mhssce\.ac\.in$")
TEACHER_REGEX = re.compile(r"^[a-z]+\.(cs|ce|it|cse|aiml|extc|mech|civil)@mhssce\.ac\.in$")
ADMIN_REGEX = re.compile(r"^admin(@mhssce\.ac\.in|(\.[a-z]+)@mhssce\.ac\.in)$")

def get_login_limit_key():
    ip = get_remote_address()
    email = ""
    if request.is_json and request.get_json():
        email = request.get_json().get('email', '')
    return f"{ip}-{email}"

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute", key_func=get_login_limit_key)
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Invalid input"}), 400
        
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')

    # Strict Email Validation
    if not (STUDENT_REGEX.match(email) or TEACHER_REGEX.match(email) or ADMIN_REGEX.match(email)):
        return jsonify({"error": "Invalid email format. Use your college email."}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        current_app.logger.warning(f"Login failed: User not found: {email}")
        return jsonify({"error": "Invalid email or password."}), 401
        
    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        current_app.logger.warning(f"Login failed: Incorrect password for: {email}")
        return jsonify({"error": "Invalid email or password."}), 401

    # Status checks
    if user.status == 'Pending':
        current_app.logger.warning(f"Login blocked: Account Pending for: {email}")
        return jsonify({"error": "Account not activated. Contact your administrator."}), 403
    if user.status == 'Inactive':
        current_app.logger.warning(f"Login blocked: Account Inactive for: {email}")
        return jsonify({"error": "Account deactivated. Contact your administrator."}), 403
        
    payload = {
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=current_app.config.get('JWT_EXPIRE_DAYS', 7))
    }
    
    token = jwt.encode(payload, current_app.config['JWT_SECRET'], algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode('utf-8')
        
    current_app.logger.info(f"Login successful for: {email}")
    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "branch": user.branch,
            "roll_no": user.roll_no,
            "phone": user.phone,
            "avatar_url": user.avatar
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def me(current_user):
    return ApiResponse.success(current_user.to_dict())

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    if not data or not data.get('oldPassword') or not data.get('newPassword'):
        return jsonify({"error": "Invalid input"}), 400
        
    if len(data['newPassword']) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    if not bcrypt.checkpw(data['oldPassword'].encode('utf-8'), current_user.password.encode('utf-8')):
        return jsonify({"error": "Incorrect current password"}), 400

    hashed_pw = bcrypt.hashpw(data['newPassword'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    current_user.password = hashed_pw
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200
