from app.database import db
from datetime import datetime

class Attendance(db.Model):
    __tablename__ = 'attendance'
    __table_args__ = (db.UniqueConstraint('student_id', 'course_id', 'date', name='uq_student_course_date'),)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('Present', 'Absent', 'Late', name='attendance_status'), nullable=False)
    marked_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', foreign_keys=[student_id])
    course = db.relationship('Course', foreign_keys=[course_id])
    marker = db.relationship('User', foreign_keys=[marked_by])

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'student_roll_no': self.student.roll_no if self.student else None,
            'course_id': self.course_id,
            'course_name': self.course.name if self.course else 'Unknown',
            'course_code': self.course.code if self.course else None,
            'date': self.date.isoformat() if self.date else None,
            'status': self.status,
            'marked_by': self.marked_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
