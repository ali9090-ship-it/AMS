from flask import Blueprint, request, jsonify
from app.models.note import Note
from app.database import db
from app.middleware.auth import token_required, role_required
from app.utils.files import save_file, delete_file
from app.utils.responses import ApiResponse

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('', methods=['GET'])
@token_required
def get_notes(current_user):
    branch = request.args.get('branch')
    semester = request.args.get('semester')
    
    query = Note.query
    
    # Matrix Rule: Student sees notes matching their branch
    if current_user.role == 'student':
        query = query.filter_by(branch=current_user.branch)
    else:
        # Admin/Teacher can filter by branch if provided, else see all
        if branch:
            query = query.filter_by(branch=branch)
            
    if semester:
        query = query.filter_by(semester=semester)
        
    notes = query.order_by(Note.created_at.desc()).all()
    return ApiResponse.success([n.to_dict() for n in notes])

@notes_bp.route('', methods=['POST'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def upload_note(current_user):
    if 'file' not in request.files:
        return ApiResponse.error("VALIDATION_ERROR", "No file part")
        
    file = request.files['file']
    if file.filename == '':
        return ApiResponse.error("VALIDATION_ERROR", "No selected file")
        
    relative_path = None
    try:
        if 'file' in request.files and request.files['file'].filename != '':
            relative_path = save_file(request.files['file'], 'notes')
        
        if not relative_path:
            return ApiResponse.error("VALIDATION_ERROR", "File is required")

        # Determine file type
        file = request.files['file']
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'unknown'
        
        with db.session.begin_nested():
            note = Note(
                title=request.form.get('title'),
                subject=request.form.get('subject'),
                description=request.form.get('description'),
                file_path=relative_path,
                file_type=ext,
                original_filename=file.filename,
                uploaded_by=current_user.id,
                branch=request.form.get('branch'),
                semester=int(request.form.get('semester')) if request.form.get('semester') else None
            )
            db.session.add(note)
        db.session.commit()
        return ApiResponse.success(note.to_dict(), status=201)
    except Exception as e:
        if relative_path:
            delete_file(relative_path)
        return ApiResponse.error("INTERNAL_ERROR", str(e))

@notes_bp.route('/<int:id>', methods=['DELETE'])
@token_required
@role_required(["TEACHER", "ADMIN"])
def remove_note(current_user, id):
    note = Note.query.get_or_404(id)
    
    if current_user.role == 'teacher' and note.uploaded_by != current_user.id:
        return ApiResponse.unauthorized("Unauthorized to delete this note")
        
    try:
        path_to_delete = note.file_path
        with db.session.begin_nested():
            db.session.delete(note)
        db.session.commit()
        
        if path_to_delete:
            delete_file(path_to_delete)
        return ApiResponse.success(message="Note deleted")
    except Exception as e:
        return ApiResponse.error("INTERNAL_ERROR", str(e))
