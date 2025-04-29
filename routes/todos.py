from flask import Blueprint, redirect, url_for, request, flash
from models import db, Todo
from datetime import datetime
from flask_login import login_required, current_user

todos = Blueprint('todos', __name__)

@todos.route('/add', methods=['POST'])
@login_required
def add():
    try:
        title = request.form.get('title')
        description = request.form.get('description')
        due_date_str = request.form.get('due_date')
        priority = request.form.get('priority')
        
        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date() if due_date_str else None
        
        new_todo = Todo(
            title=title,
            description=description,
            due_date=due_date,
            priority=priority,
            created_by=current_user.id
        )
        
        db.session.add(new_todo)
        db.session.commit()
        flash('Task added successfully!', 'success')
    except Exception as e:
        flash(f'Error adding task: {str(e)}', 'error')
    
    return redirect(url_for('index'))

@todos.route('/update_status/<int:id>/<string:status>', methods=['GET', 'POST'])
@login_required
def update_status(id, status):
    todo = Todo.query.get_or_404(id)
    todo.status = status
    db.session.commit()
    return redirect(url_for('enhanced_features'))

@todos.route('/delete/<int:id>', methods=['GET', 'POST'])
@login_required
def delete(id):
    todo = Todo.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return redirect(url_for('enhanced_features'))