from flask import Flask, jsonify, request, session as flask_session
from auth.login import auth as auth_bp, limiter
from products.products import products_bp
from models import db, Message, User
from flask_socketio import SocketIO, emit, join_room
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file at startup
# This makes BREVO_API_KEY available to email_service module
load_dotenv()

app = Flask(__name__)

# Database configuration
# Ensure instance folder exists and use a stable absolute DB path
os.makedirs(app.instance_path, exist_ok=True)
db_file = os.path.abspath(os.path.join(app.instance_path, "users.db"))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_file}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# Initialize database
db.init_app(app)


# Initialize Flask rate limiter
limiter.init_app(app)


# Initialize/register Flask blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
from messages import messages_bp
app.register_blueprint(messages_bp, url_prefix="/api")
app.register_blueprint(products_bp, url_prefix="/products")


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


# Allow localhost:3000 and 3001 with credentials
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001']:
        response.headers['Access-Control-Allow-Origin'] = origin
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



# initialize Socket.IO (after app = Flask(__name__))
socketio = SocketIO(
app,
    cors_allowed_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    manage_session=False,
    async_mode="gevent",
    logger=True,
    engineio_logger=False
)

# Socket.IO event handlers (place these before the run call)
@socketio.on("connect")
def handle_connect():
    user_id = flask_session.get("user_id")
    if user_id:
        join_room(f"user_{user_id}")

        # Send recent messages involving this user (helps deliver missed messages)
        recent = (
            Message.query
            .filter((Message.recipient_id == user_id) | (Message.sender_id == user_id))
            .order_by(Message.created_at.desc())
            .limit(50)
            .all()
        )
        # build recent_payload with usernames
        recent_payload = []
        for m in reversed(recent):
            d = m.to_dict()
            s = User.query.get(m.sender_id)
            r = User.query.get(m.recipient_id)
            d["sender_username"] = s.username if s else None
            d["recipient_username"] = r.username if r else None
            recent_payload.append(d)

        if recent_payload:
            socketio.emit("message_history", {"messages": recent_payload}, room=f"user_{user_id}")

    emit("connected", {"msg": "connected"})

@socketio.on("join")
def handle_join(data):
    # client can explicitly join a room (e.g. { "user_id": 2 } or username)
    raw = data.get("user_id")
    if raw is None:
        return

    # normalize to integer id (allow passing username or id)
    try:
        uid = int(raw)
    except (ValueError, TypeError):
        u = User.query.filter_by(username=raw).first()
        if not u:
            return
        uid = u.id

    join_room(f"user_{uid}")

def _resolve_user_raw(val):
    # accepts an int-like value or a username; returns numeric id or None
    if val is None:
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        u = User.query.filter_by(username=val).first()
        return u.id if u else None

@socketio.on("send_message")
def handle_send_message(data):
    # data: { sender_id (id or username), recipient_id (id or username), body, client_id? }
    raw_sender = data.get("sender_id")
    raw_recipient = data.get("recipient_id")
    sender = _resolve_user_raw(raw_sender) or flask_session.get("user_id")
    recipient = _resolve_user_raw(raw_recipient)
    body = (data.get("body") or "").strip()
    if not sender or not recipient or not body:
        return

    # persist message
    msg = Message(sender_id=sender, recipient_id=recipient, body=body)
    db.session.add(msg)
    db.session.commit()
    out = msg.to_dict()

    # add readable usernames so clients can detect "mine" reliably
    sender_user = User.query.get(sender)
    recipient_user = User.query.get(recipient)
    out["sender_username"] = sender_user.username if sender_user else None
    out["recipient_username"] = recipient_user.username if recipient_user else None

    # echo back client_id if provided so client can reconcile optimistic message
    client_id = data.get("client_id")
    if client_id:
        out["client_id"] = client_id

    # emit new_message to recipient and sender rooms
    socketio.emit("new_message", out, room=f"user_{recipient}")
    socketio.emit("new_message", out, room=f"user_{sender}")

    logger.info(
        "Persisted message %s from %s to %s — emitting to rooms %s and %s",
        out.get("id"),
        sender,
        recipient,
        f"user_{recipient}",
        f"user_{sender}"
    )


if __name__ == "__main__":
    # Ensure eventlet is installed (server async worker for websockets)
    # Start the Socket.IO server here (top-level)
    socketio.run(app, debug=True, port=5001)