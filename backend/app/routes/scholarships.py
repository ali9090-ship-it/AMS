from flask import Blueprint, request, jsonify
from app.models.scholarship import Scholarship, ScholarshipApplication
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.responses import ApiResponse
from sqlalchemy.exc import IntegrityError

scholarships_bp = Blueprint('scholarships', __name__)

@scholarships_bp.route('', methods=['GET'])
@token_required
def get_scholarships(current_user):
    scholarships = Scholarship.query.all()
    res = []
    for s in scholarships:
        data = s.to_dict()
        if current_user.role == 'student':
            app = ScholarshipApplication.query.filter_by(student_id=current_user.id, scholarship_id=s.id).first()
            data['my_application_status'] = app.status if app else None
        res.append(data)
    return ApiResponse.success(res)

@scholarships_bp.route('', methods=['POST'])
@token_required
@role_required(["ADMIN"])
def create_scholarship(current_user):
    data = request.get_json()
    try:
        with db.session.begin_nested():
            s = Scholarship(
                name=data.get('name'),
                description=data.get('description'),
                amount=data.get('amount'),
                criteria=data.get('criteria') or data.get('eligibility'),
                deadline=data.get('deadline'),
                created_by=current_user.id
            )
            db.session.add(s)
        db.session.commit()
        return ApiResponse.success(s.to_dict(), status=201)
    except Exception as e:
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@scholarships_bp.route('/<int:id>', methods=['PUT'])
@token_required
@role_required(["ADMIN"])
def update_scholarship(current_user, id):
    s = Scholarship.query.get_or_404(id)
    data = request.get_json()
    try:
        if 'name' in data: s.name = data['name']
        if 'description' in data: s.description = data['description']
        if 'amount' in data: s.amount = data['amount']
        if 'criteria' in data: s.criteria = data['criteria']
        if 'eligibility' in data: s.criteria = data['eligibility']
        if 'deadline' in data: s.deadline = data['deadline']
        
        with db.session.begin_nested():
            db.session.add(s)
        db.session.commit()
        return ApiResponse.success(s.to_dict())
    except Exception as e:
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@scholarships_bp.route('/<int:id>', methods=['DELETE'])
@token_required
@role_required(["ADMIN"])
def delete_scholarship(current_user, id):
    s = Scholarship.query.get_or_404(id)
    try:
        with db.session.begin_nested():
            ScholarshipApplication.query.filter_by(scholarship_id=id).delete()
            db.session.delete(s)
        db.session.commit()
        return ApiResponse.success(message="Scholarship deleted")
    except Exception as e:
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@scholarships_bp.route('/<int:id>/apply', methods=['POST'])
@token_required
@role_required(["STUDENT"])
def apply_scholarship(current_user, id):
    s = Scholarship.query.get_or_404(id)
    try:
        with db.session.begin_nested():
            app = ScholarshipApplication(student_id=current_user.id, scholarship_id=id)
            db.session.add(app)
        db.session.commit()
        return ApiResponse.success(app.to_dict(), status=201)
    except IntegrityError:
        return ApiResponse.error("DUPLICATE_ENTRY", "Already applied for this scholarship", status=409)
    except Exception as e:
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@scholarships_bp.route('/applications', methods=['GET'])
@token_required
@role_required(["ADMIN"])
def get_applications(current_user):
    apps = ScholarshipApplication.query.all()
    return ApiResponse.success([a.to_dict() for a in apps])

@scholarships_bp.route('/applications/<int:id>', methods=['PUT'])
@token_required
@role_required(["ADMIN"])
def update_application(current_user, id):
    app = ScholarshipApplication.query.get_or_404(id)
    data = request.get_json()
    if 'status' in data:
        app.status = data['status']
    db.session.commit()
    return ApiResponse.success(app.to_dict())

@scholarships_bp.route('/applications/my', methods=['GET'])
@token_required
@role_required(["STUDENT"])
def get_my_scholarship_applications(current_user):
    apps = ScholarshipApplication.query.filter_by(student_id=current_user.id).all()
    res = []
    for a in apps:
        d = a.to_dict()
        d['scholarship'] = a.scholarship.to_dict() if a.scholarship else None
        res.append(d)
    return ApiResponse.success(res)
