import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const BASE_URL = "http://localhost:3001";
const API_URL = `${BASE_URL}/api/auth`;

const getSavedAuth = () => {
  try {
    const stored = localStorage.getItem("chat-auth");
    return stored ? JSON.parse(stored) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

function App() {
  const [{ token, user }, setAuth] = useState(getSavedAuth);

  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [status, setStatus] = useState("");
  const [socketError, setSocketError] = useState("");

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const socket = useMemo(() => {
    if (!token) return null;
    return io(BASE_URL, { auth: { token } });
  }, [token]);

  /* ================= SOCKET EVENTS ================= */

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => setStatus("Connected"));

    socket.on("receive_room_message", (data) =>
      setMessages((prev) => [...prev, data])
    );

    socket.on("room_created", ({ room }) => {
      setCurrentRoom(room);
      setRoomCodeInput(room);
      localStorage.setItem("lastRoom", room);
      setMessages([]);
    });

    socket.on("room_joined", ({ room }) => {
      setCurrentRoom(room);
      localStorage.setItem("lastRoom", room);
      fetchRoomHistory(room);
    });

    socket.on("room_left", () => {
  setCurrentRoom("");
  setRoomCodeInput("");     // 🔑 clear room code
  setMessages([]);
  setMessage("");           // 🔑 clear input box
  setStatus("You left the room");
});

    socket.on("online_users", (users) => setOnlineUsers(users));

    socket.on("connect_error", (err) =>
      setSocketError(err.message || "Socket error")
    );

    return () => socket.disconnect();
  }, [socket]);

  /* ================= HELPERS ================= */

  const fetchRoomHistory = async (room) => {
    if (!room || !token) return;
    try {
      setLoadingHistory(true);
      const res = await fetch(`${BASE_URL}/api/messages?room=${room}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data);
    } catch {
      setStatus("Failed to load messages");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAuth = async () => {
    try {
      setStatus("Please wait...");
      const endpoint = authMode === "login" ? "login" : "register";

      const payload =
        authMode === "login"
          ? { email: form.email, password: form.password }
          : form;

      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Auth failed");

      setAuth({ token: data.token, user: data.user });
      localStorage.setItem(
        "chat-auth",
        JSON.stringify({ token: data.token, user: data.user })
      );
      setStatus("");
    } catch (err) {
      setStatus(err.message);
    }
  };

  const sendMessage = () => {
    if (!socket || !message.trim() || !currentRoom) return;
    socket.emit("send_room_message", {
      message: message.trim(),
      room: currentRoom,
    });
    setMessage("");
  };

const leaveRoom = () => {
  if (!socket || !currentRoom) return;

  // ✅ OPTIMISTIC UI UPDATE (IMMEDIATE)
  setCurrentRoom("");
  setRoomCodeInput("");
  setMessages([]);
  setMessage("");
  setStatus("You left the room");
localStorage.removeItem("lastRoom");
  // 🔔 Inform backend
  socket.emit("leave_room");
};

  const handleLogout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem("chat-auth");
    setMessages([]);
    setCurrentRoom("");
  };

  const isLoggedIn = Boolean(token && user);

  /* ================= UI ================= */

  return (
    <div className="app">
      {isLoggedIn && (
      <header className="header">
        <h1>Chatting APP</h1>
        
          <div className="user-info">
            <span>Welcome {user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
      </header>
        )}

      {!isLoggedIn ? (
        /* ========== AUTH SCREEN ========== */
        <div className="auth-wrapper">
           <div className="auth-container">
          <h1 className="auth-title">Chatting App</h1>
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={authMode === "login" ? "active" : ""}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                className={authMode === "register" ? "active" : ""}
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
            </div>

            {authMode === "register" && (
              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
              />
            )}

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
            />

            <button className="auth-submit" onClick={handleAuth}>
              {authMode === "login" ? "Login" : "Create Account"}
            </button>

            {/* {status && <p className="status">{status}</p>} */}
          </div>
        </div>
        </div>
      ) : (
        /* ========== CHAT LAYOUT ========== */
        <div className="chat-layout">
          <aside className="sidebar">
            <h3>Online Users</h3>
            <ul>
              {onlineUsers.map((u) => (
                <li key={u.id}>{u.username}</li>
              ))}
            </ul>
          </aside>

          <section className="chat-main">
            <div className="chat-header">
              <div>
                <strong>
                  {currentRoom ? `Room ${currentRoom}` : "No room joined"}
                </strong>
                <p className="muted">
                  {loadingHistory ? "Loading..." : "Group chat"}
                </p>
              </div>

              <div className="room-buttons">
                {!currentRoom ? (
                  <>
                    <button onClick={() => socket.emit("create_room")}>
                      Create Room
                    </button>
                    <input
                      placeholder="Room code"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                    />
                    <button
                      onClick={() =>
                        socket.emit("join_room", roomCodeInput.trim())
                      }
                      disabled={!roomCodeInput.trim()}
                    >
                      Join
                    </button>
                  </>
                ) : (
                  <button className="leave-btn" onClick={leaveRoom}>
                    Leave Room
                  </button>
                )}
              </div>
            </div>

            <div className="messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${
                    msg.senderName === user.username ? "own" : ""
                  }`}
                >
                  <div className="meta">
                    <span>{msg.senderName}</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text">{msg.message}</div>
                </div>
              ))}
            </div>

            <div className="composer">
              <input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!currentRoom}
              />
              <button onClick={sendMessage} disabled={!currentRoom}>
                Send
              </button>
            </div>

            {socketError && <p className="error">{socketError}</p>}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
