import os
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_profile_image(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Create uploads directory if it doesn't exist
        upload_path = os.path.join('static', 'uploads', 'profiles')
        os.makedirs(upload_path, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(upload_path, filename)
        file.save(file_path)
        
        # Return the relative path for database storage
        return os.path.join('uploads', 'profiles', filename)
    return None