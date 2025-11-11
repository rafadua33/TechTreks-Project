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



app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret")

IS_PROD = os.environ.get("FLASK_ENV") == "production"

# secure session cookie settings
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=IS_PROD,        # set True in production (requires HTTPS)
    SESSION_COOKIE_SAMESITE="Lax",     # or "Strict"
    PERMANENT_SESSION_LIFETIME=3600,   # seconds, optional
)

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.register_blueprint(auth_bp, url_prefix="/auth")


@app.route("/")
def welcome():
    return ""

#@app.route("/items/", methods = ['GET'])
#def get_item():
#    return items

if __name__ == "__main__":
    app.run(debug = True)