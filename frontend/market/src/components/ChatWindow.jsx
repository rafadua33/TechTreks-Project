import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { IoSend } from "react-icons/io5";

const SOCKET_URL = "http://localhost:5001";

function isNumericString(s) {
  return typeof s === "string" && /^\d+$/.test(s);
}

export default function ChatWindow() {
  const { me, other } = useParams(); // these are route params (could be username or numeric id)
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [error, setError] = useState(null);
  const [meId, setMeId] = useState(null); // numeric id from /auth/me (if available)
  const [meName, setMeName] = useState(null); // username from /auth/me (if available)
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch authoritative "me" info (id + username) from backend
  useEffect(() => {
    let cancelled = false;
    async function fetchMe() {
      try {
        const res = await fetch(`${SOCKET_URL}/auth/me`, { credentials: "include" });
        if (!res.ok) {
          // backend may return 401 if not logged in; that's okay
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (data && data.id) {
          setMeId(data.id);
        }
        if (data && data.username) {
          setMeName(data.username);
        }
      } catch (err) {
        // non-fatal — keep using route param for display
        console.debug("Failed to fetch /auth/me:", err);
      }
    }
    fetchMe();
    return () => { cancelled = true; };
  }, []);

  // Load message history (server accepts username or id in query)
  useEffect(() => {
    async function fetchHistory() {
      try {
        const user1 = meId != null ? String(meId) : me;
        const user2 = other;
        const res = await fetch(
          `${SOCKET_URL}/api/messages?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : data.messages || []);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to load messages", err);
        setError(err.message);
      }
    }
    fetchHistory();
    // reload if route params or meId change
  }, [me, other, meId]);

  // Setup socket once
  useEffect(() => {
    setError(null);
    socketRef.current = io(SOCKET_URL, { withCredentials: true, transports: ["websocket", "polling"] });
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.info("socket connected", socket.id);
      setSocketStatus("connected");
      // prefer authoritative numeric id when available
      const joinId = meId != null ? meId : me;
      socket.emit("join", { user_id: joinId });
    });

    socket.on("disconnect", (reason) => {
      console.warn("socket disconnected", reason);
      setSocketStatus("disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("socket connect_error", err);
      setError("Socket connect error: " + (err.message || err));
      setSocketStatus("error");
    });

    socket.on("message_history", (data) => {
      if (data && Array.isArray(data.messages)) {
        setMessages(data.messages);
        scrollToBottom();
      }
    });

    socket.on("new_message", (msg) => {
      // DEBUG: show incoming message and local identity info
      console.log("DEBUG new_message received:", {
        msg,
        route_me: me,
        meId,
        meName
      });

      setMessages((prev) => {
        if (prev.length && prev[prev.length - 1]?.id === msg.id) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    return () => {
      try { socket.disconnect(); } catch (e) {}
      setSocketStatus("disconnected");
    };
    // note: do not include meId here so socket isn't recreated when meId resolves;
    // we send join separately when meId becomes available.
  }, []); // run once

  // If meId becomes available after the socket connected, emit join with numeric id
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (meId != null && socket.connected) {
      socket.emit("join", { user_id: meId });
    }
  }, [meId]);

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
  }

  async function handleSend(e) {
    e?.preventDefault();
    const body = text.trim();
    if (!body) return;

    // sender/recipient resolution (same as current)
    const sender = meId != null ? meId : me;
    const recipient = isNumericString(other) ? Number(other) : other;
    if (!sender || !recipient) {
      setError("Cannot send: missing sender or recipient id");
      return;
    }

    // emit and wait — do NOT add optimistic message
    try {
      socketRef.current?.emit("send_message", { sender_id: sender, recipient_id: recipient, body });
      setText("");
    } catch (err) {
      console.error("Send failed", err);
      setError("Send failed: " + err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white/5 rounded-md min-h-[60vh] flex flex-col">
      <header className="pb-2 border-b border-white/10 mb-2 flex justify-between items-center">
        <div>
          <h2 className="text-white text-lg">
            Chat — you: {meName ?? me} • other: {other}
          </h2>
          <div className="text-xs text-white/60">Messages: {messages.length}</div>
        </div>
        <div className="text-sm">
          <span className={`px-2 py-1 rounded ${socketStatus === "connected" ? "bg-green-600" : "bg-red-600"}`}>
            {socketStatus}
          </span>
        </div>
      </header>

      {error && <div className="mb-2 text-red-400 text-sm">Error: {error}</div>}

      <div className="flex-1 overflow-auto mb-4 px-2" style={{ maxHeight: "60vh" }}>
        {messages.length === 0 && <div className="text-white/60">No messages yet.</div>}
        {messages.map((m) => {
          // determine if message is mine; compare numeric id when available
          const mine = (
            // prefer numeric match when we have it
            (meId != null && m.sender_id === meId) ||
            // otherwise, if server provided sender_username and we fetched meName, compare usernames
            (meName && m.sender_username && m.sender_username === meName) ||
            // fallback: if meName not set, compare sender_username with the route param 'me'
            (m.sender_username && String(m.sender_username) === String(me)) ||
            (meId == null && String(m.sender_id) === String(me))
          );
          return (
            <div key={m.id ?? `${m.sender_id}-${m.created_at}-${Math.random()}`} className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`px-3 py-2 rounded-lg max-w-[75%] ${mine ? "bg-[#E0B0FF]/80 text-[#000328] rounded-xl" : "bg-white/10 text-white/90 rounded-xl border-[#E0B0FF]/50 border-2"}`}>
                <div className="text-sm">{m.body}</div>
                <div className="text-xs mt-1">{new Date(m.created_at || Date.now()).toLocaleString()}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-md bg-white/10 text-white outline-none"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
        />
        <button type="submit" className="px-4 py-2 bg-[#E0B0FF] text-white rounded-xl"><IoSend /></button>
      </form>
    </div>
  );
}