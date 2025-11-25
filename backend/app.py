from flask import Flask, jsonify, request
from auth.login import auth as auth_bp, limiter
from models import db
import logging
import os


app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# Initialize database
db.init_app(app)


# Initialize Flask rate limiter
limiter.init_app(app)


# Initialize/register Flask blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")


# Create database tables if they don't exist
with app.app_context():
    db.create_all()


# Secret key for session management
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-in-production")


# Determine if running in production
IS_PROD = os.environ.get("FLASK_ENV") == "production"


# Session cookie settings
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=False,  # False for local HTTP development
    SESSION_COOKIE_SAMESITE='Lax',  # Changed from 'None' to 'Lax' for local dev
    SESSION_COOKIE_DOMAIN=None,  # Don't restrict domain
    PERMANENT_SESSION_LIFETIME=3600,
)


# Allow localhost:3000 with credentials
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Basic route to verify backend is running
@app.route("/")
def welcome():
    return f"Backend is running on port 5001"

if __name__ == "__main__":
    app.run(debug=True, port=5001)