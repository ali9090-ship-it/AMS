import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('JWT_SECRET', 'super-secret')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET = os.environ.get('JWT_SECRET', 'super-secret')
    JWT_EXPIRE_DAYS = int(os.environ.get('JWT_EXPIRE_DAYS', 7))
    
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    MAX_FILE_SIZE_MB = int(os.environ.get('MAX_FILE_SIZE_MB', 20))
    # Flask sets it in bytes
    MAX_CONTENT_LENGTH = MAX_FILE_SIZE_MB * 1024 * 1024
