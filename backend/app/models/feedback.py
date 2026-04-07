from app.database import db
from datetime import datetime

class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', foreign_keys=[student_id])
    course = db.relationship('Course', foreign_keys=[course_id])

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id if not self.is_anonymous else None,
            'course_id': self.course_id,
            'course_name': self.course.name if self.course else None,
            'course_code': self.course.code if self.course else None,
            'teacher_name': self.course.teacher.name if self.course and self.course.teacher else None,
            'rating': self.rating,
            'comment': self.comment,
            'is_anonymous': self.is_anonymous,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'student_name': self.student.name if self.student and not self.is_anonymous else 'Anonymous Student'
        }
