from app.database import db
from datetime import datetime

class Admission(db.Model):
    __tablename__ = 'admissions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_data = db.Column(db.JSON, nullable=False) # name, email, phone, branch etc
    documents = db.Column(db.String(500))
    status = db.Column(db.Enum('Pending', 'Approved', 'Rejected', name='admission_status'), default='Pending')
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reviewer = db.relationship('User', foreign_keys=[reviewed_by])

    def to_dict(self):
        return {
            'id': self.id,
            'student_data': self.student_data,
            'documents': self.documents,
            'status': self.status,
            'reviewed_by': self.reviewed_by,
            'reviewer_name': self.reviewer.name if self.reviewer else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
