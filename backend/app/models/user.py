from app.database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('student', 'teacher', 'admin', name='user_roles'), nullable=False)
    branch = db.Column(db.String(50))
    roll_no = db.Column(db.String(30))
    phone = db.Column(db.String(20))
    avatar = db.Column(db.String(500))
    status = db.Column(db.Enum('Pending', 'Active', 'Inactive', name='user_statuses'), default='Pending')
    deleted_at = db.Column(db.DateTime, nullable=True)
    risk_level = db.Column(db.Enum('Low', 'Medium', 'High', name='risk_levels'), default='Medium')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'branch': self.branch,
            'roll_no': self.roll_no,
            'phone': self.phone,
            'avatar': self.avatar,
            'avatar_url': self.avatar,
            'status': self.status,
            'risk_level': self.risk_level,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
