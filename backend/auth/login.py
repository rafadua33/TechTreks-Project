from flask import Blueprint, request, jsonify, session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User, PendingVerification
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from email_service import send_verification_email
import re
import random
import logging

auth = Blueprint("auth", __name__)

# Configure logging for authentication events
logger = logging.getLogger(__name__)

# initialize rate limiter (prevent spam and brute force)
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://", default_limits=["200 per day", "50 per hour"])


def generate_verification_code():
    """
    Generate a random 4-digit verification code for email confirmation
    
    Returns a string of 4 random digits (e.g., "5738")
    This is used in the email verification flow - user receives this code
    via email and must enter it to complete registration.
    """
    return str(random.randint(1000, 9999))


# Register route - UPDATED for email verification
@auth.route("/register", methods=["POST"])
@limiter.limit("10 per hour") # limit to 10 registration attempts per hour per IP
def register():
    """
    Step 1 of email verification: Store registration data temporarily
    
    This endpoint receives registration data and validates it, but does NOT
    create a User account yet. Instead:
    1. Validate all input (username, email format/domain, password)
    2. Check if username/email are already taken
    3. Generate a 4-digit verification code
    4. Store all data in PendingVerification table temporarily
    5. Send verification code to user's email
    6. Return status and tell user to check their email
    
    Only after the user verifies their email (via /verify-email endpoint)
    will the actual User account be created.
    
    Request JSON:
        {
            "username": "john.doe",
            "email": "john.doe@nyu.edu",
            "password": "SecurePass123!"
        }
    
    Response on success (201):
        {
            "ok": true,
            "msg": "verification code sent to email",
            "email": "john.doe@nyu.edu"
        }
    
    Response on validation error (400):
        {
            "error": "description of what went wrong"
        }
    """
    
    # Get JSON data from request
    data = request.get_json() or {}

    # validate input - handle return value
    valid, payload_or_err = validate_registration_payload(data)
    if not valid:
        return jsonify({"error": payload_or_err}), 400

    username = payload_or_err["username"]
    password = payload_or_err["password"]
    email = payload_or_err["email"]

    # Check if username or email already exists in User table
    # (they might also be in PendingVerification, but we'll replace that)
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already taken"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already registered"}), 409

    # Generate 4-digit verification code and hash password
    code = generate_verification_code()
    password_hash = generate_password_hash(password)
    
    # Calculate expiration time (10 minutes from now)
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Check if there's already a pending verification for this email/username
    # If so, delete it (user is starting over)
    existing = PendingVerification.query.filter(
        (PendingVerification.email == email) | (PendingVerification.username == username)
    ).first()
    if existing:
        db.session.delete(existing)
    
    # Create new pending verification record
    # This stores the user's info temporarily until they verify their email
    pending = PendingVerification(
        email=email,
        username=username,
        password_hash=password_hash,
        code=code,
        expires_at=expires_at,
        attempts=0
    )
    
    try:
        db.session.add(pending)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating pending verification: {e}")
        return jsonify({"error": "failed to process registration"}), 500
    
    # Send verification code via email
    # If email service fails, we've still stored the data, user can try again
    email_sent = send_verification_email(email, code)
    if not email_sent:
        logger.warning(f"Failed to send verification email to {email}, but pending verification created")
        return jsonify({"error": "failed to send verification email"}), 500
    
    # Success: tell frontend to show verification code input page
    logger.info(f"Registration initiated for {email}, verification code sent")
    return jsonify({
        "ok": True,
        "msg": "verification code sent to email",
        "email": email
    }), 201


# Verify email route - STEP 2 of email verification
@auth.route("/verify-email", methods=["POST"])
@limiter.limit("20 per minute")  # limit to 20 verification attempts per minute per IP
def verify_email():
    """
    Step 2 of email verification: Verify code and create User account
    
    This endpoint is called after the user receives the verification code
    in their email and enters it on the verification page.
    
    Flow:
    1. Find the pending verification record by email
    2. Check if code matches (case-insensitive)
    3. Check if code has expired (10 minute window)
    4. Check attempt count to prevent brute force (max 5 attempts)
    5. If all good, create the User account
    6. Delete the pending verification record
    7. Log the user in immediately
    
    Request JSON:
        {
            "email": "john.doe@nyu.edu",
            "code": "5738"
        }
    
    Response on success (200):
        {
            "ok": true,
            "msg": "email verified and account created",
            "user": {
                "id": 1,
                "username": "john.doe",
                "email": "john.doe@nyu.edu"
            }
        }
    
    Response on failure (400/401):
        {
            "error": "description of error"
        }
    """
    
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    code = (data.get("code") or "").strip()
    
    # Validate input
    if not email or not code:
        return jsonify({"error": "email and code are required"}), 400
    
    # Find the pending verification record
    pending = PendingVerification.query.filter_by(email=email).first()
    if not pending:
        return jsonify({"error": "no pending verification for this email"}), 404
    
    # Check if code has expired (10 minute window)
    if pending.is_expired():
        db.session.delete(pending)
        db.session.commit()
        return jsonify({"error": "verification code expired"}), 401
    
    # Check attempt limit to prevent brute force (max 5 wrong attempts)
    if pending.attempts >= 5:
        db.session.delete(pending)
        db.session.commit()
        logger.warning(f"Too many verification attempts for {email}")
        return jsonify({"error": "too many failed attempts, please register again"}), 429
    
    # Check if code matches
    if code != pending.code:
        # Increment failed attempts
        pending.increment_attempts()
        remaining = 5 - pending.attempts
        return jsonify({
            "error": f"invalid code",
            "remaining_attempts": remaining
        }), 401
    
    # Code is correct! Create the actual User account
    try:
        new_user = User(
            username=pending.username,
            email=pending.email,
            password_hash=pending.password_hash
        )
        db.session.add(new_user)
        db.session.flush()  # Get the user ID
        
        # Delete the pending verification record (no longer needed)
        db.session.delete(pending)
        db.session.commit()
        
        # Log the user in immediately (set session)
        session.clear()
        session['user_id'] = new_user.id
        session.permanent = True
        
        logger.info(f"User {new_user.username} created and logged in after email verification")
        
        return jsonify({
            "ok": True,
            "msg": "email verified and account created",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email
            }
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        logger.error(f"Integrity error creating user {pending.username}")
        return jsonify({"error": "username or email already taken"}), 409
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating user after verification: {e}")
        return jsonify({"error": "failed to create account"}), 500


# Resend verification code route
@auth.route("/resend-code", methods=["POST"])
@limiter.limit("5 per hour")  # limit resend to 5 times per hour per IP
def resend_code():
    """
    Resend verification code to user's email
    
    If the user didn't receive the verification code in their email,
    they can request it to be sent again. This endpoint:
    1. Finds their pending verification
    2. Checks it hasn't expired
    3. Generates a NEW 4-digit code
    4. Resets the expiration timer (another 10 minutes)
    5. Resets the attempt counter (fresh start for guessing)
    6. Sends the new code via email
    
    Request JSON:
        {
            "email": "john.doe@nyu.edu"
        }
    
    Response on success (200):
        {
            "ok": true,
            "msg": "new verification code sent"
        }
    """
    
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    
    if not email:
        return jsonify({"error": "email is required"}), 400
    
    # Find pending verification
    pending = PendingVerification.query.filter_by(email=email).first()
    if not pending:
        return jsonify({"error": "no pending verification for this email"}), 404
    
    # Generate a new code
    new_code = generate_verification_code()
    
    # Update the pending record with new code and expiration
    pending.code = new_code
    pending.expires_at = datetime.utcnow() + timedelta(minutes=10)
    pending.attempts = 0  # Reset failed attempts counter
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating pending verification: {e}")
        return jsonify({"error": "failed to resend code"}), 500
    
    # Send the new code via email
    email_sent = send_verification_email(email, new_code)
    if not email_sent:
        return jsonify({"error": "failed to send verification email"}), 500
    
    logger.info(f"Resent verification code to {email}")
    return jsonify({
        "ok": True,
        "msg": "new verification code sent"
    }), 200


# Login route
@auth.route("/login", methods=["POST"])
@limiter.limit("20 per minute")  # limit to 20 login attempts per minute per IP
def login():
    """
    Log in an existing user
    
    Authenticate a user by username and password. If credentials are correct,
    set a session cookie to keep them logged in.
    
    Request JSON:
        {
            "username": "john.doe",
            "password": "SecurePass123!"
        }
    
    Response on success (200):
        {
            "ok": true,
            "msg": "login successful"
        }
    
    Response on failure (400/401):
        {
            "error": "description of error"
        }
    """
    
    # Get JSON data from request
    data = request.get_json() or {}

    # Extract username and password 
    username = data.get("username")
    password = data.get("password")

    # Validate input - both fields are required
    if not username or not password:
        return jsonify({"error": "missing credentials"}), 400
    
    # Look up user by username in the User table
    user = User.query.filter_by(username=username).first()
    
    # Verify user exists and password is correct using secure hash comparison
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401
    
    # Log the user in by setting a session cookie
    # The session persists across requests until logout
    session.clear()
    session['user_id'] = user.id
    session.permanent = True

    logger.info(f"User {username} logged in")
    return jsonify({"ok": True, "msg": "login successful"}), 200


# Logout route
@auth.route("/logout", methods=["POST"])
def logout():
    """
    Log out the current user
    
    Clear the session cookie to end the user's session.
    After this, they will need to log in again.
    
    Response on success (200):
        {
            "ok": true,
            "msg": "logout successful"
        }
    """
    username = None
    user_id = session.get("user_id")
    if user_id:
        user = User.query.get(user_id)
        if user:
            username = user.username
    
    session.clear()
    logger.info(f"User {username} logged out")
    return jsonify({"ok": True, "msg": "logout successful"}), 200


# Get current user endpoint
@auth.route("/me", methods=["GET"])
def me():
    """
    Get information about the currently logged-in user
    
    This endpoint returns the user's profile information if they are logged in.
    Used by the frontend to verify authentication state and display user info.
    
    Response if logged in (200):
        {
            "user": {
                "id": 1,
                "username": "john.doe",
                "email": "john.doe@nyu.edu"
            }
        }
    
    Response if not logged in (200):
        {
            "user": null
        }
    """
    
    # Get user ID from session
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"user": None}), 200
    
    # Look up the user
    user = User.query.get(user_id)
    if not user:
        return jsonify({"user": None}), 200
    
    return jsonify({"user": {"id": user.id, "username": user.username, "email": user.email}}), 200


# Check username/email availability endpoint
@auth.route("/check", methods=["POST"])
@limiter.limit("20 per minute")
def check_availability():
    """
    Check if a username or email is available
    
    Used by the frontend registration form to give real-time feedback
    on whether a username/email is already taken. This happens as the user
    types in the registration form.
    
    Request JSON (one or both):
        {
            "username": "john.doe",
            "email": "john.doe@nyu.edu"
        }
    
    Response (200):
        {
            "username_available": true,
            "email_available": false
        }
    """
    
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()

    resp = {}
    
    # Check if username is available (not already taken)
    if username:
        resp["username_available"] = User.query.filter_by(username=username).first() is None
    
    # Check if email is available (not already registered)
    if email:
        resp["email_available"] = User.query.filter_by(email=email).first() is None

    return jsonify(resp), 200


# Helper function to validate registration json
def validate_registration_payload(data):
    """
    Validate user registration input data
    
    This function performs comprehensive validation of registration data to ensure
    data integrity and security. It checks:
    - Username: length, allowed characters, format
    - Email: format, NYU domain (@nyu.edu)
    - Password: length, complexity (uppercase, lowercase, numbers, special chars)
    
    Returns a tuple: (is_valid, payload_or_error_message)
    - If valid: (True, {"username": "...", "email": "...", "password": "..."})
    - If invalid: (False, "error message")
    
    Args:
        data (dict): Request data containing 'username', 'email', 'password'
    
    Returns:
        tuple: (bool, dict or str) - validation status and data/error
    
    Example:
        >>> valid, result = validate_registration_payload({
        ...     "username": "john.doe",
        ...     "email": "john.doe@nyu.edu",
        ...     "password": "SecurePass123!"
        ... })
        >>> if valid:
        ...     username = result["username"]
    """
    
    # Extract and normalize input data
    # .strip() removes whitespace, .lower() normalizes email case
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    # ============ CHECK: Required fields ============
    # All three fields must be present and non-empty
    if not username or not email or not password:
        return False, "username, email and password are required"

    # ============ CHECK: Username length ============
    # Username must be 3-30 characters to be memorable but not excessive
    if len(username) < 3 or len(username) > 30:
        return False, "username must be 3-30 characters"

    # ============ CHECK: Username characters ============
    # Allow alphanumeric, underscores, dots, hyphens
    # Reject special characters that could cause issues
    # Pattern: letters (A-Z, a-z), numbers (0-9), underscore, dot, hyphen
    if not re.match(r"^[A-Za-z0-9_.-]+$", username):
        return False, "username contains invalid characters"

    # ============ CHECK: Email format ============
    # Basic email validation: must contain @ and be under 254 characters (RFC 5321)
    if "@" not in email or len(email) > 254:
        return False, "invalid email"
    
    # ============ CHECK: Email domain - MUST BE @NYU.EDU ============
    # TechTreks is for NYU community only - enforce NYU email domain
    # This is critical for the student marketplace concept
    if not email.endswith("@nyu.edu"):
        return False, "only NYU email addresses are allowed (@nyu.edu)"

    # ============ CHECK: Password length ============
    # Minimum 8 characters is industry standard for security
    if len(password) < 8:
        return False, "password must be at least 8 characters"

    # ============ CHECK: Password complexity - UPPERCASE ============
    # At least one uppercase letter (A-Z)
    # Increases complexity and helps prevent brute force attacks
    if not re.search(r"[A-Z]", password):
        return False, "password must contain at least one uppercase letter"

    # ============ CHECK: Password complexity - LOWERCASE ============
    # At least one lowercase letter (a-z)
    if not re.search(r"[a-z]", password):
        return False, "password must contain at least one lowercase letter"

    # ============ CHECK: Password complexity - NUMBER ============
    # At least one digit (0-9)
    if not re.search(r"[0-9]", password):
        return False, "password must contain at least one number"

    # ============ CHECK: Password complexity - SPECIAL CHARACTER ============
    # At least one special character from this set: !@#$%^&*(),.?":{}|<>
    # Makes password more resistant to dictionary attacks
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "password must contain at least one special character"

    # ============ ALL VALIDATION PASSED ============
    # Return normalized data (username and email are clean, password unchanged)
    # This data will be used to either create User or PendingVerification record
    return True, {"username": username, "email": email, "password": password}

