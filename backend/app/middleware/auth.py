from functools import wraps
from flask import request, jsonify, current_app
import jwt
from app.models.user import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'error': 'No token, unauthorized'}), 401
            
        try:
            data = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=["HS256"])
            current_user = User.query.get(int(data['user_id']))
            if not current_user:
                return jsonify({'error': 'User no longer exists.'}), 401
            if current_user.status != 'Active':
                return jsonify({'error': 'Account deactivated.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired. Please login again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalid or tampered.'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def role_required(roles):
    """
    Checks if current_user has one of the specified roles.
    Expects a list like ["STUDENT"], ["TEACHER", "ADMIN"].
    Must be used AFTER @token_required
    """
    if isinstance(roles, str):
        roles = [roles]
        
    roles_lower = [r.lower() for r in roles]
        
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role.lower() not in roles_lower:
                required = ', '.join(roles)
                return jsonify({'error': f'Access forbidden. Required role: {required}'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
