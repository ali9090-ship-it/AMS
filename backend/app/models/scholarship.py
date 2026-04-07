from app.database import db
from datetime import datetime

class Scholarship(db.Model):
    __tablename__ = 'scholarships'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    amount = db.Column(db.Numeric(10, 2))
    criteria = db.Column(db.Text)
    deadline = db.Column(db.Date)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    creator = db.relationship('User', foreign_keys=[created_by])

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'amount': float(self.amount) if self.amount else None,
            'criteria': self.criteria,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ScholarshipApplication(db.Model):
    __tablename__ = 'scholarship_applications'
    __table_args__ = (db.UniqueConstraint('student_id', 'scholarship_id', name='uq_student_scholarship'),)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    scholarship_id = db.Column(db.Integer, db.ForeignKey('scholarships.id'))
    status = db.Column(db.Enum('Pending', 'Approved', 'Rejected', name='scholarship_application_status'), default='Pending')
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', foreign_keys=[student_id])
    scholarship = db.relationship('Scholarship', foreign_keys=[scholarship_id])

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'scholarship_id': self.scholarship_id,
            'status': self.status,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'student': { 'name': self.student.name, 'email': self.student.email, 'roll_no': self.student.roll_no } if self.student else None,
            'scholarship': { 'name': self.scholarship.name } if self.scholarship else None
        }
