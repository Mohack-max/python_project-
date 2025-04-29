import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Mail configuration placeholders
    MAIL_SERVER = 'smtp.example.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'mohamedyoussoufkeita4@gmail.com  '
    MAIL_PASSWORD = 'k u d d l a n i s v q s h i y l'
