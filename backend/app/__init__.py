import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from app.config import Config
from app.database import db, migrate

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for the React frontend
    CORS(app)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    from app.limiter import limiter
    limiter.init_app(app)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.courses import courses_bp
    from app.routes.attendance import attendance_bp
    from app.routes.results import results_bp
    from app.routes.announcements import announcements_bp
    from app.routes.notes import notes_bp
    from app.routes.scholarships import scholarships_bp
    from app.routes.placement import placement_bp
    from app.routes.feedback import feedback_bp
    from app.routes.admissions import admissions_bp
    from app.routes.exams import exams_bp
    from app.routes.ai import ai_bp
    from app.routes.reports import reports_bp
    from app.routes.settings import settings_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(results_bp, url_prefix='/api/results')
    app.register_blueprint(announcements_bp, url_prefix='/api/announcements')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(scholarships_bp, url_prefix='/api/scholarships')
    app.register_blueprint(placement_bp, url_prefix='/api/placement')
    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')
    app.register_blueprint(admissions_bp, url_prefix='/api/admissions')
    app.register_blueprint(exams_bp, url_prefix='/api/exams')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')

    # Serve uploaded files statically
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        uploads_dir = os.path.join(app.root_path, '..', 'uploads')
        return send_from_directory(uploads_dir, filename)

    # Health check route
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy'}, 200

    return app
