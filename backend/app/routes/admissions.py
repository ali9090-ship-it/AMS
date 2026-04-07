from flask import Blueprint, request, jsonify
from app.models.admission import Admission
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.files import save_file, delete_file
from app.utils.responses import ApiResponse

admissions_bp = Blueprint('admissions', __name__)

# Note: No @token_required here as this is a public endpoint
@admissions_bp.route('', methods=['POST'])
def submit_admission():
    docs_path = None
    try:
        if 'file' in request.files and request.files['file'].filename != '':
            docs_path = save_file(request.files['file'], 'admissions')
            
        student_data = {
            'applicant_name': request.form.get('applicant_name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'branch_applied': request.form.get('branch_applied'),
            'address': request.form.get('address'),
        }
        
        with db.session.begin_nested():
            admission = Admission(
                student_data=student_data,
                documents=docs_path
            )
            db.session.add(admission)
        db.session.commit()
        return ApiResponse.success(admission.to_dict(), status=201)
    except Exception as e:
        if docs_path:
            delete_file(docs_path)
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@admissions_bp.route('', methods=['GET'])
@token_required
@role_required(["ADMIN"])
def get_admissions(current_user):
    admissions = Admission.query.order_by(Admission.created_at.desc()).all()
    return ApiResponse.success([a.to_dict() for a in admissions])

@admissions_bp.route('/<int:id>', methods=['PUT'])
@token_required
@role_required(["ADMIN"])
def update_admission(current_user, id):
    admission = Admission.query.get_or_404(id)
    data = request.get_json()
    
    if 'status' in data:
        admission.status = data['status']
        admission.reviewed_by = current_user.id
        
    db.session.commit()
    return ApiResponse.success(admission.to_dict())

@admissions_bp.route('/my', methods=['GET'])
@token_required
@role_required(["STUDENT"])
def get_my_admissions(current_user):
    # Match student using email inside student_data JSON
    all_admissions = Admission.query.all()
    my_admissions = [a for a in all_admissions if a.student_data.get('email') == current_user.email]
    return ApiResponse.success([a.to_dict() for a in my_admissions])
