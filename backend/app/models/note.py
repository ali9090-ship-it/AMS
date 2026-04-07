from app.database import db
from datetime import datetime

class Note(db.Model):
    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100))
    description = db.Column(db.Text)
    file_path = db.Column(db.String(500))
    file_type = db.Column(db.String(20))
    original_filename = db.Column(db.String(255))
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    branch = db.Column(db.String(50))
    semester = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    uploader = db.relationship('User', foreign_keys=[uploaded_by])

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'subject': self.subject,
            'description': self.description,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'original_filename': self.original_filename,
            'uploaded_by': self.uploaded_by,
            'uploader_name': self.uploader.name if self.uploader else None,
            'branch': self.branch,
            'semester': self.semester,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
