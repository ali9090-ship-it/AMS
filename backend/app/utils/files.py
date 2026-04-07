import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'jpeg', 'png', 'zip', 'webp', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, subfolder):
    if not file:
        raise ValueError("No file provided")
    
    if not allowed_file(file.filename):
        raise ValueError("File type not allowed")
        
    # Task 28 - File Security: Size limit check
    file.seek(0, os.SEEK_END)
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)
    if size_mb > current_app.config.get('MAX_FILE_SIZE_MB', 20):
        raise ValueError(f"File too large. Max allowed: {current_app.config.get('MAX_FILE_SIZE_MB', 20)}MB")

    original_filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
    
    # Construct base upload path from current app path
    # e.g. path/to/backend/app -> path/to/backend
    base_dir = os.path.dirname(current_app.root_path)
    relative_path = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder, unique_filename)
    absolute_path = os.path.join(base_dir, relative_path)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    
    # Save the file
    file.save(absolute_path)
    
    # Return relative path for database (e.g., uploads/notes/abc_file.pdf)
    return relative_path.replace('\\', '/')

def delete_file(file_path):
    if not file_path:
        return
        
    base_dir = os.path.dirname(current_app.root_path)
    absolute_path = os.path.join(base_dir, file_path)
    
    if os.path.exists(absolute_path):
        try:
            os.remove(absolute_path)
        except OSError:
            pass
