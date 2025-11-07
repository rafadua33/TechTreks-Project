from app import app, db
from models import User
import os


# ran only once to initialize the database
def init_db():
    # Ensure instance folder exists
    os.makedirs('instance', exist_ok=True)
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database initialized successfully!")
        
        # Verify User table
        if User.query.count() == 0:
            print("Database is empty (ready for new users)")
        else:
            print(f"Found {User.query.count()} existing users")

if __name__ == "__main__":
    init_db()