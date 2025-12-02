# backend/messages.py
from flask import Blueprint, request, jsonify, session
from models import db, Message, User

messages_bp = Blueprint("messages", __name__)

def resolve_user_param(val):
    if val is None:
        return None
    # if it's already an integer string, convert
    try:
        return int(val)
    except (ValueError, TypeError):
        # otherwise treat as username and look up id
        u = User.query.filter_by(username=val).first()
        return u.id if u else None

@messages_bp.route("/messages", methods=["GET"])
def get_messages():
    raw_u1 = request.args.get("user1")
    raw_u2 = request.args.get("user2")
    u1 = resolve_user_param(raw_u1)
    u2 = resolve_user_param(raw_u2)

    if not u1 or not u2:
        return jsonify({"error": "user1 and user2 required (id or username)"}), 400

    msgs = Message.query.filter(
        ((Message.sender_id == u1) & (Message.recipient_id == u2)) |
        ((Message.sender_id == u2) & (Message.recipient_id == u1))
    ).order_by(Message.created_at.asc()).all()
    return jsonify([m.to_dict() for m in msgs])

@messages_bp.route("/messages", methods=["POST"])
def send_message():
    data = request.get_json() or {}
    sender = data.get("sender_id") or session.get("user_id")
    recipient = data.get("recipient_id")
    body = data.get("body", "").strip()
    if not sender or not recipient or not body:
        return jsonify({"error": "missing fields"}), 400
    msg = Message(sender_id=sender, recipient_id=recipient, body=body)
    db.session.add(msg)
    db.session.commit()
    return jsonify(msg.to_dict()), 201

@messages_bp.route("/messages/inbox", methods=["GET"])
def get_inbox():
    # Accepts 'recipient' (id or username) or 'recipient_username' / 'user'
    raw = request.args.get("recipient") or request.args.get("recipient_username") or request.args.get("user")
    if raw is None:
        return jsonify({"error": "recipient query param required (id or username)"}), 400

    # resolve_user_param already converts username -> id
    rid = resolve_user_param(raw)
    if not rid:
        return jsonify({"error": "recipient not found"}), 404

    # fetch messages where recipient == rid (newest first)
    msgs = Message.query.filter(Message.recipient_id == rid).order_by(Message.created_at.desc()).all()

    # include sender_username for convenience
    out = []
    for m in msgs:
        d = m.to_dict()
        s = User.query.get(m.sender_id)
        d["sender_username"] = s.username if s else None
        out.append(d)
    return jsonify(out)