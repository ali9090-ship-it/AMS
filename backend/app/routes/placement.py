from flask import Blueprint, request, jsonify
from app.models.placement import PlacementJob, PlacementApplication
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.files import save_file, delete_file
from app.utils.responses import ApiResponse
from sqlalchemy.exc import IntegrityError
import os

placement_bp = Blueprint('placement', __name__)

@placement_bp.route('/jobs', methods=['GET'])
@token_required
def get_jobs(current_user):
    jobs = PlacementJob.query.all()
    res = []
    for j in jobs:
        data = j.to_dict()
        if current_user.role == 'student':
            app = PlacementApplication.query.filter_by(student_id=current_user.id, job_id=j.id).first()
            data['my_application_status'] = app.status if app else None
        res.append(data)
    return ApiResponse.success(res)

@placement_bp.route('/jobs', methods=['POST'])
@token_required
@role_required(["ADMIN"])
def create_job(current_user):
    brochure_path = None
    if 'file' in request.files and request.files['file'].filename != '':
        try:
            brochure_path = save_file(request.files['file'], 'brochures')
        except Exception as e:
            return ApiResponse.error("UPLOAD_ERROR", str(e))
            
    try:
        job = PlacementJob(
            company=request.form.get('company'),
            role=request.form.get('role'),
            package=request.form.get('package'),
            description=request.form.get('description'),
            deadline=request.form.get('deadline'),
            eligibility=request.form.get('eligibility'),
            brochure_url=brochure_path,
            posted_by=current_user.id
        )
        db.session.add(job)
        db.session.commit()
        return ApiResponse.success(job.to_dict(), status=201)
    except Exception as e:
        db.session.rollback()
        if brochure_path:
            delete_file(brochure_path) # Task 34: Cleanup on failure
        return ApiResponse.error("DB_ERROR", str(e))

@placement_bp.route('/jobs/<int:id>', methods=['PUT'])
@token_required
@role_required(["ADMIN"])
def update_job(current_user, id):
    job = PlacementJob.query.get_or_404(id)
    new_path = None
    old_path = job.brochure_url
    
    try:
        # Handle optional file update
        if 'file' in request.files and request.files['file'].filename != '':
            new_path = save_file(request.files['file'], 'brochures')
            job.brochure_url = new_path
            
        if 'company' in request.form: job.company = request.form.get('company')
        if 'role' in request.form: job.role = request.form.get('role')
        if 'package' in request.form: job.package = request.form.get('package')
        if 'description' in request.form: job.description = request.form.get('description')
        if 'deadline' in request.form: job.deadline = request.form.get('deadline')
        if 'eligibility' in request.form: job.eligibility = request.form.get('eligibility')

        db.session.commit()
        if new_path and old_path:
            delete_file(old_path)
        return ApiResponse.success(job.to_dict())
    except Exception as e:
        db.session.rollback()
        if new_path:
            delete_file(new_path)
        return ApiResponse.error("DB_ERROR", str(e))

@placement_bp.route('/jobs/<int:id>', methods=['DELETE'])
@token_required
@role_required(["ADMIN"])
def delete_job(current_user, id):
    job = PlacementJob.query.get_or_404(id)
    
    try:
        # Delete applications files
        apps = PlacementApplication.query.filter_by(job_id=id).all()
        for a in apps:
            if a.resume_path: 
                delete_file(a.resume_path) # Task 34: Delete from disk on record delete
            db.session.delete(a)
            
        if job.brochure_url:
            delete_file(job.brochure_url)
            
        db.session.delete(job)
        db.session.commit()
        return ApiResponse.success(message="Job deleted")
    except Exception as e:
        db.session.rollback()
        return ApiResponse.error("DB_ERROR", str(e))

@placement_bp.route('/jobs/<int:id>/apply', methods=['POST'])
@token_required
@role_required(["STUDENT"])
def apply_job(current_user, id):
    job = PlacementJob.query.get_or_404(id)
    # Manual check removed to prove DB constraint and file rollback
        
    if 'file' not in request.files or request.files['file'].filename == '':
        return ApiResponse.error("VALIDATION_ERROR", "Resume file required")
        
    resume_path = None
    try:
        resume_path = save_file(request.files['file'], 'resumes')
        with db.session.begin_nested():
            app = PlacementApplication(
                student_id=current_user.id,
                job_id=id,
                resume_path=resume_path
            )
            db.session.add(app)
            db.session.flush()
        db.session.commit()
        return ApiResponse.success(app.to_dict(), status=201)
    except IntegrityError:
        db.session.rollback()
        if resume_path: delete_file(resume_path)
        return ApiResponse.error("DUPLICATE_ENTRY", "You have already applied for this job", status=409)
    except Exception as e:
        db.session.rollback()
        if resume_path: delete_file(resume_path)
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@placement_bp.route('/applications', methods=['GET'])
@token_required
@role_required(["ADMIN", "TEACHER"])
def get_applications(current_user):
    apps = PlacementApplication.query.all()
    return ApiResponse.success([a.to_dict() for a in apps])

@placement_bp.route('/applications/<int:id>', methods=['PUT'])
@token_required
@role_required(["ADMIN"])
def update_application(current_user, id):
    app = PlacementApplication.query.get_or_404(id)
    data = request.get_json()
    if 'status' in data:
        app.status = data['status']
    db.session.commit()
    return ApiResponse.success(app.to_dict())

@placement_bp.route('/applications/my', methods=['GET'])
@token_required
@role_required(["STUDENT"])
def get_my_placement_applications(current_user):
    apps = PlacementApplication.query.filter_by(student_id=current_user.id).all()
    res = []
    for a in apps:
        d = a.to_dict()
        d['job'] = a.job.to_dict() if a.job else None
        res.append(d)
    return ApiResponse.success(res)
