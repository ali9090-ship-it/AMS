from flask import Blueprint, request
from app.models.setting import Setting
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.responses import ApiResponse

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('', methods=['GET'])
@token_required
@role_required(["ADMIN"])
def get_settings(current_user):
    settings = Setting.query.all()
    result = {}
    for s in settings:
        result[s.key] = s.value
    return ApiResponse.success(result)

@settings_bp.route('', methods=['PUT'])
@token_required
@role_required(["ADMIN"])
def update_settings(current_user):
    data = request.get_json()
    if not data:
        return ApiResponse.error("VALIDATION_ERROR", "No data provided")
    
    try:
        for key, value in data.items():
            setting = Setting.query.filter_by(key=key).first()
            if setting:
                setting.value = str(value)
            else:
                setting = Setting(key=key, value=str(value))
                db.session.add(setting)
        db.session.commit()
        
        settings = Setting.query.all()
        result = {s.key: s.value for s in settings}
        return ApiResponse.success(result)
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("INTERNAL_ERROR", str(e))
