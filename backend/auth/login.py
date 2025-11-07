from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User
import re

auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["POST"])
def register():
    # Get JSON data from request
    data = request.get_json() or {}

    # validate input
    validate_registration_payload(data)

    # Extract username and password
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")
    
    # Create new user
    password_hash = generate_password_hash(password)
    new_user = User(username=username, password_hash=password_hash, email=email) 
    db.session.add(new_user)
    db.session.commit()

    # return a good response back to frontend
    return jsonify({"ok": True, "msg": "user registered"}), 201

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
    # prevent session fixation: clear any existing session before setting new values
    session.clear()
    session['user_id'] = user.id
    session.permanent = True

    # return good response back to frontend
    return jsonify({"ok": True, "msg": "login successful"}), 200

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

    if len(password) < 8:
        return False, "password must be at least 8 characters"

    # if password != confirm:
    #    return False, "passwords do not match"

    # add any blocklist checks (reserved usernames, disposable domains) here

    return True, {"username": username, "email": email, "password": password}