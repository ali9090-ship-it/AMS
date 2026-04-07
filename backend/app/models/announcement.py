from app.database import db
from datetime import datetime

class Announcement(db.Model):
    __tablename__ = 'announcements'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    type = db.Column(db.Enum('Exam', 'Event', 'Notice', 'General', name='announcement_types'), default='General')
    target_role = db.Column(db.Enum('student', 'teacher', 'all', name='target_roles'), default='all')
    posted_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    author = db.relationship('User', foreign_keys=[posted_by])

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'type': self.type,
            'target_role': self.target_role,
            'posted_by': self.posted_by,
            'author_name': self.author.name if self.author else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
