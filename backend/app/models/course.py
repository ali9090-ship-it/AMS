from app.database import db
from datetime import datetime

class TeacherCourse(db.Model):
    __tablename__ = 'teacher_courses'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    teacher = db.relationship('User', backref='course_assignments')
    course = db.relationship('Course', backref='teacher_assignments')

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    branch = db.Column(db.String(50))
    semester = db.Column(db.Integer)
    credits = db.Column(db.Integer, default=4)
    schedule = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    teacher = db.relationship('User', backref='taught_courses', foreign_keys=[teacher_id])

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'teacher_id': self.teacher_id,
            'teacher': self.teacher.to_dict() if self.teacher else None,
            'branch': self.branch,
            'semester': self.semester,
            'credits': self.credits,
            'schedule': self.schedule,
            'student_count': len(self.enrollments) if getattr(self, 'enrollments', None) is not None else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class CourseEnrollment(db.Model):
    __tablename__ = 'course_enrollments'
    __table_args__ = (db.UniqueConstraint('student_id', 'course_id', name='uq_student_course'),)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', backref='enrollments', foreign_keys=[student_id])
    course = db.relationship('Course', backref='enrollments', foreign_keys=[course_id])

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'enrolled_at': self.enrolled_at.isoformat() if self.enrolled_at else None
        }
