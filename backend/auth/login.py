from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User

auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["POST"])
def register():
    # Get JSON data from request
    data = request.get_json() or {}

    # Extract username and password
    username = data.get("username")
    password = data.get("password")

    # Validate input
    if not username or not password:
        return jsonify({"error": "missing credentials"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 409
    
    # Create new user
    password_hash = generate_password_hash(password)
    new_user = User(username=username, password_hash=password_hash)
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
    session['user_id'] = user.id

    # return good response back to frontend
    return jsonify({"ok": True, "msg": "login successful"}), 200