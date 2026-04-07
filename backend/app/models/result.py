from app.database import db
from datetime import datetime

class Result(db.Model):
    __tablename__ = 'results'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    semester = db.Column(db.Integer, nullable=False)
    exam_type = db.Column(db.Enum('Mid-Sem', 'End-Sem', 'Internal', name='exam_types'))
    marks_obtained = db.Column(db.Float, nullable=False)
    total_marks = db.Column(db.Float, nullable=False)
    grade = db.Column(db.String(5))
    grade_point = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', foreign_keys=[student_id])
    course = db.relationship('Course', foreign_keys=[course_id])

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'student_roll_no': self.student.roll_no if self.student else None,
            'course_id': self.course_id,
            'course_name': self.course.name if self.course else 'Unknown',
            'course_code': self.course.code if self.course else None,
            'semester': self.semester,
            'exam_type': self.exam_type,
            'marks_obtained': self.marks_obtained,
            'total_marks': self.total_marks,
            'grade': self.grade,
            'grade_point': self.grade_point,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
