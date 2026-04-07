from app import create_app
from app.database import db

app = create_app()

with app.app_context():
    try:
        db.engine.connect()
        print("Connected successfully!")
    except Exception as e:
        print(f"Connection failed: {e}")
