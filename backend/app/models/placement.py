from app.database import db
from datetime import datetime

class PlacementJob(db.Model):
    __tablename__ = 'placement_jobs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(150), nullable=False)
    package = db.Column(db.String(50))
    description = db.Column(db.Text)
    deadline = db.Column(db.Date)
    eligibility = db.Column(db.Text)
    brochure_url = db.Column(db.String(500))
    posted_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    poster = db.relationship('User', foreign_keys=[posted_by])

    def to_dict(self):
        return {
            'id': self.id,
            'company': self.company,
            'role': self.role,
            'package': self.package,
            'description': self.description,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'eligibility': self.eligibility,
            'brochure_url': self.brochure_url,
            'posted_by': self.posted_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class PlacementApplication(db.Model):
    __tablename__ = 'placement_applications'
    __table_args__ = (db.UniqueConstraint('student_id', 'job_id', name='uq_student_job'),)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    job_id = db.Column(db.Integer, db.ForeignKey('placement_jobs.id'))
    resume_path = db.Column(db.String(500))
    status = db.Column(db.Enum('Applied', 'Shortlisted', 'Selected', 'Rejected', name='placement_application_status'), default='Applied')
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', foreign_keys=[student_id])
    job = db.relationship('PlacementJob', foreign_keys=[job_id])

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'job_id': self.job_id,
            'resume_path': self.resume_path,
            'status': self.status,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'student': { 'name': self.student.name, 'email': self.student.email, 'roll_no': self.student.roll_no } if self.student else None,
            'job': { 'company': self.job.company, 'role': self.job.role } if self.job else None
        }
