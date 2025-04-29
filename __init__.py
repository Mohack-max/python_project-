from flask import Flask
from flask_login import LoginManager
from flask_mail import Mail
from config import Config
from models import db, User

login_manager = LoginManager()
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app) 

    from routes.auth import auth
    app.register_blueprint(auth)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    return app