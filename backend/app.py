from flask import Flask, jsonify, request
from flask_cors import CORS
from auth.login import auth as auth_bp
from models import db
import logging
import os


app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)    

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-in-production")

IS_PROD = os.environ.get("FLASK_ENV") == "production"

# Session cookie settings - FIX: Use Lax for development
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=False,  # False for local HTTP development
    SESSION_COOKIE_SAMESITE='Lax',  # Changed from 'None' to 'Lax' for local dev
    SESSION_COOKIE_DOMAIN=None,  # Don't restrict domain
    PERMANENT_SESSION_LIFETIME=3600,
)

# CORS configuration - allow credentials from frontend origin
CORS(app, 
     resources={r"/*": {"origins": "http://localhost:3000"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.register_blueprint(auth_bp, url_prefix="/auth")

@app.route("/")
def welcome():
    return "Backend is running on port 5001!"

if __name__ == "__main__":
    app.run(debug=True, port=5001)