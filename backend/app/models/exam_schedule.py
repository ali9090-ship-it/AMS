from app.database import db
from datetime import datetime

class ExamSchedule(db.Model):
    __tablename__ = 'exam_schedules'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)  # e.g. Mid-Sem 2026
    subject = db.Column(db.String(100), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=True)
    exam_date = db.Column(db.String(50), nullable=False) # Store as string for simpler UI handling or Date
    start_time = db.Column(db.String(50))
    room = db.Column(db.String(50))
    status = db.Column(db.String(50), default='Scheduled') # Scheduled, Draft, Completed
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    creator = db.relationship('User', foreign_keys=[created_by])
    course = db.relationship('Course', foreign_keys=[course_id])

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'subject': self.subject,
            'course_id': self.course_id,
            'course_code': self.course.code if self.course else None,
            'exam_date': self.exam_date,
            'start_time': self.start_time,
            'room': self.room,
            'status': self.status,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
