from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message  # Import Flask-Mail
from datetime import datetime
import os
import json
from werkzeug.serving import run_simple
from flask_apscheduler import APScheduler

app = Flask(__name__)
from config import Config
from routes.todos import todos

app.register_blueprint(todos, url_prefix='/todoemail')

app.config.from_object(Config)
db = SQLAlchemy(app)


app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'mohamedyoussoufkeita4@gmail.com'
app.config['MAIL_PASSWORD'] = 'k u d d l a n i s v q s h i y l'
mail = Mail(app)

class Todo(db.Model):
    __tablename__ = 'todoemail'
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

@app.route('/email', methods=['GET', 'POST'])
@app.route('/email', methods=['GET', 'POST'])
def email_reminder_view():
    if request.method == 'POST':
        user_email = request.form.get('email')
        todo = Todo.query.filter_by(user_email=user_email).first()
        if todo:
            send_reminder_email(todo)  
        return redirect(url_for('index'))
    return render_template('email.html')




with app.app_context():
    db.create_all()

@app.route('/')
def index():
    todos = Todo.query.all()
    return render_template('index.html', todos=todos)

@app.route('/add', methods=['POST'])
def add():
    title = request.form.get('title')
    description = request.form.get('description')
    priority = request.form.get('priority', 'medium')
    due_date_str = request.form.get('due_date')
    user_email = request.form.get('email')  # Ensure email is captured from the form
    
    due_date = None
    if due_date_str:
        try:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d')
        except ValueError:
            pass
    
    new_todo = Todo(
        title=title,
        description=description,
        priority=priority,
        due_date=due_date,
        user_email=user_email  # Store user email in the database
    )
    
    db.session.add(new_todo)
    db.session.commit()
    
    # Send reminder email
    if user_email:
        send_reminder_email(new_todo)
    
    return redirect(url_for('index'))
def send_reminder_email(todo):
    """Send reminder email to the user."""
    msg = Message('Todo Reminder', sender='mohamedyoussoufkeita4@gmail.com', recipients=[todo.user_email])
    msg.body = f"Reminder: You have a todo titled '{todo.title}' due on {todo.due_date.strftime('%Y-%m-%d')}."
    mail.send(msg)

def check_due_dates():
    """Check for todos with due dates approaching and send reminders."""
    with app.app_context():
        todos = Todo.query.all()
        for todo in todos:
            if todo.due_date and (todo.due_date - datetime.utcnow()).days <= 1:  # Check if due date is within 1 day
                send_reminder_email(todo)

# Initialize APScheduler
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# Schedule the check_due_dates function to run every day
scheduler.add_job(id='check_due_dates', func=check_due_dates, trigger='interval', hours=24)

@app.route('/delete/<int:id>')
def delete(id):
    todo = Todo.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/update_status/<int:id>/<string:status>', methods=['GET', 'POST'])
def update_status(id, status):
    todo = Todo.query.get_or_404(id)
    todo.status = status
    db.session.commit()
    return redirect(url_for('enhanced_features'))

@app.route('/enhanced-features')
def enhanced_features():
    todos = Todo.query.all()
    stats = {
        'total': len(todos),
        'completed': len([t for t in todos if t.status == 'completed']),
        'pending': len([t for t in todos if t.status == 'pending']),
        'high_priority': len([t for t in todos if t.priority == 'high']),
        'medium_priority': len([t for t in todos if t.priority == 'medium']),
        'low_priority': len([t for t in todos if t.priority == 'low'])
    }
    
    completion_percentage = 0
    if stats['total'] > 0:
        completion_percentage = round((stats['completed'] / stats['total']) * 100)
    
    return render_template('enhanced-features.html', todos=todos, stats=stats, completion_percentage=completion_percentage)


@app.route('/api/todos', methods=['GET'])
def get_todos():
    todos = Todo.query.all()
    return jsonify([todo.to_dict() for todo in todos])

@app.route('/api/todos/filter', methods=['GET'])
def filter_todos():
    status = request.args.get('status')
    priority = request.args.get('priority')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    search = request.args.get('search')
    
    query = Todo.query
    
    if status and status != 'all':
        query = query.filter(Todo.status == status)
    
    if priority and priority != 'all':
        query = query.filter(Todo.priority == priority)
    
    if from_date:
        try:
            from_date_obj = datetime.strptime(from_date, '%Y-%m-%d')
            query = query.filter(Todo.due_date >= from_date_obj)
        except ValueError:
            pass
    
    if to_date:
        try:
            to_date_obj = datetime.strptime(to_date, '%Y-%m-%d')
            query = query.filter(Todo.due_date <= to_date_obj)
        except ValueError:
            pass
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Todo.title.like(search_term)) | 
            (Todo.description.like(search_term))
        )
    
    todos = query.all()
    return jsonify([todo.to_dict() for todo in todos])

@app.route('/api/todos/export', methods=['GET'])
def export_todos():
    format_type = request.args.get('format', 'json')
    todos = Todo.query.all()
    
    if format_type == 'json':
        return jsonify([todo.to_dict() for todo in todos])
    elif format_type == 'csv':
        csv_data = "id,title,description,priority,status,due_date,created_at\n"
        for todo in todos:
            todo_dict = todo.to_dict()
            csv_data += f"{todo.id},\"{todo.title}\",\"{todo.description}\",{todo.priority},{todo.status},{todo_dict['due_date']},{todo_dict['created_at']}\n"
        
        return csv_data, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=todos.csv'
        }
    
    return jsonify({'error': 'Invalid format'}), 400

@app.route('/api/todos/<int:id>/complete', methods=['POST'])
def complete_todo(id):
    todo = Todo.query.get_or_404(id)
    todo.status = 'completed'
    db.session.commit()
    return jsonify(todo.to_dict())

@app.route('/api/stats', methods=['GET'])
def get_stats():
    todos = Todo.query.all()
    stats = {
        'total': len(todos),
        'completed': len([t for t in todos if t.status == 'completed']),
        'pending': len([t for t in todos if t.status == 'pending']),
        'high_priority': len([t for t in todos if t.priority == 'high']),
        'medium_priority': len([t for t in todos if t.priority == 'medium']),
        'low_priority': len([t for t in todos if t.priority == 'low'])
    }
    

    if stats['total'] > 0:
        stats['completion_percentage'] = round((stats['completed'] / stats['total']) * 100)
    else:
        stats['completion_percentage'] = 0
    
    return jsonify(stats)

@app.route('/email', methods=['GET', 'POST'])
def email_reminder():
    if request.method == 'POST':
        user_email = request.form.get('email')
        # Logic to send email reminder
        send_reminder_email(user_email)
        return redirect(url_for('index'))
    return render_template('email.html')

def send_reminder_email(Todo):
    """Send reminder email to the user."""
    msg = Message('Todo Reminder', sender='mohamedyoussoufkeita4@gmail.com', recipients=[todo.user_email])
    msg.body = f"Reminder: You have a todo titled '{todo.title}' due on {todo.due_date.strftime('%Y-%m-%d')}."
    mail.send(msg)
    

if __name__ == '__main__':
    
    host = '0.0.0.0'  
    port = 5000
    
    print(f"Todo App is running on http://{host}:{port}")
    print("To access from other devices on your network, use your computer's IP address:")
    
    import socket
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    print(f"http://{ip_address}:{port}")
    

    app.run(host=host, port=port, debug=True)