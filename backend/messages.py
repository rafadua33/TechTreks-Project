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