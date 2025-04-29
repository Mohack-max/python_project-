from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Todo(db.Model):
    __tablename__ = 'todos'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(20), default='pending')
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_email = db.Column(db.String(255))  # Add user email field

    def __repr__(self):
        return f'<Todo {self.id}: {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'due_date': self.due_date.strftime('%Y-%m-%d') if self.due_date else None,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'user_email': self.user_email 
        }