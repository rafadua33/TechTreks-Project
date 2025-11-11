from app import app, db
from models import User
import os


# ran only once to initialize the database
def init_db():
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database initialized successfully!")
        
        # Verify User table
        try:
            user_count = User.query.count()
            print(f"Found {user_count} existing users")
        except:
            print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()