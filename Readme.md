## Chatting App – Real-Time Group Chat Application

A modern real-time chat application built using React, Node.js, Socket.IO, and MongoDB.
The app supports user authentication, group-based chat rooms, real-time messaging, and a clean dark-themed UI designed for daily usage.

# Features
I. Authentication

1.User Registration & Login
2.Secure authentication using JWT
3.Auth-protected APIs
4.Persistent login using browser storage

II. Real-Time Chat

1.Create chat rooms instantly
2.Join existing rooms using a room code
3.Send and receive messages in real time
4.Messages are synced across all users in the room

III. Room Management

1.Create Room
2.Join Room
3.Leave Room (without page reload)
4.Automatic UI update on room leave
5.System messages for join/leave events

IV. Persistence

1.Chat history stored in MongoDB
2.Messages fetched automatically when joining a room
3.Last joined room restored after page reload

V. UI & UX

1.Modern dark theme
2.Clean and professional layout
3.Responsive design
4.Optimistic UI updates for smooth experience

# Tech Stack

I. Frontend

1.React (Vite)
2.Socket.IO Client
3.CSS (Custom Dark Theme)
4.LocalStorage for session persistence

II. Backend

1.Node.js
2.Express.js
3.Socket.IO
4.MongoDB + Mongoose
5.JWT Authentication

# Installation & Setup
I. Clone the Repository

1. git clone https://github.com/your-username/chatting-app.git
2. cd chatting-app

II. Backend Setup

1. cd backend
2. npm install


III. Create a .env file inside backend/:

PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


IV. Start the backend server:

1. npm start

V.Frontend Setup

1. cd frontend
2. npm install
3. npm run dev


