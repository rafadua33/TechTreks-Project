from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User
from sqlalchemy.exc import IntegrityError
import re

auth = Blueprint("auth", __name__)


# Register route
@auth.route("/register", methods=["POST"])
def register():
    # Get JSON data from request
    data = request.get_json() or {}

    # validate input - handle return value
    valid, payload_or_err = validate_registration_payload(data)
    if not valid:
        return jsonify({"error": payload_or_err}), 400

    username = payload_or_err["username"]
    password = payload_or_err["password"]
    email = payload_or_err["email"]

    # Check if username or email already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already taken"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already registered"}), 409

    # Create new user
    password_hash = generate_password_hash(password)
    new_user = User(username=username, password_hash=password_hash, email=email) 
    db.session.add(new_user)
    
    # Commit and handle race conditions
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "username or email already taken"}), 409

    # return a good response back to frontend
    return jsonify({"ok": True, "msg": "user registered"}), 201


# Login route
@auth.route("/login", methods=["POST"])
def login():

    # Get JSON data from request
    data = request.get_json() or {}

    # Extract username and password 
    username = data.get("username")
    password = data.get("password")

    # Validate input
    if not username or not password:
        return jsonify({"error": "missing credentials"}), 400
    
    # look up user
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401
    
    # Log the user in by setting session
    session.clear()
    session['user_id'] = user.id
    session.permanent = True

    return jsonify({"ok": True, "msg": "login successful"}), 200


# Logout route
@auth.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True, "msg": "logout successful"}), 200


# New: get current user
@auth.route("/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"user": None}), 200
    user = User.query.get(user_id)
    if not user:
        return jsonify({"user": None}), 200
    return jsonify({"user": {"id": user.id, "username": user.username, "email": user.email}}), 200


# New: check availability for username/email
@auth.route("/check", methods=["POST"])
def check_availability():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()

    resp = {}
    if username:
        resp["username_available"] = User.query.filter_by(username=username).first() is None
    if email:
        resp["email_available"] = User.query.filter_by(email=email).first() is None

    return jsonify(resp), 200


# Helper function to validate registration json
def validate_registration_payload(data):
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    # for adding password confirmation confirm = data.get("confirm_password") or ""

    if not username or not email or not password:
        return False, "username, email and password are required"

    if len(username) < 3 or len(username) > 30:
        return False, "username must be 3-30 characters"

    if not re.match(r"^[A-Za-z0-9_.-]+$", username):
        return False, "username contains invalid characters"

    # basic email check; use a proper validator for production
    if "@" not in email or len(email) > 254:
        return False, "invalid email"

    # basic password checks
    if len(password) < 8:
        return False, "password must be at least 8 characters"

    if not re.search(r"[A-Z]", password):
        return False, "password must contain at least one uppercase letter"

    if not re.search(r"[a-z]", password):
        return False, "password must contain at least one lowercase letter"

    if not re.search(r"[0-9]", password):
        return False, "password must contain at least one number"

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "password must contain at least one special character"

    return True, {"username": username, "email": email, "password": password}

