Overview
This project is an online code collaboration platform.  
It allows **one mentor** and **multiple students** to work together on different **code blocks** in real-time.

The app is built with:
- **React** (client-side)
- **FastAPI** (server-side)
- **Firebase Firestore** (database)

---

Features
- ✅ **Lobby page** listing available code blocks (questions).
- ✅ **Code block page** where:
  - The first user becomes the **Mentor** (read-only view).
  - Other users are **Students** (can edit the code).
- ✅ **Real-time WebSocket** connection:
  - Students' codes update live on the mentor’s screen.
  - Student count updates live for all users.
- ✅ **Syntax Highlighting** inside the code editor (PrismJS).
- ✅ **Solution check**: If a student's answer matches the correct solution, a **smiley** appears.
- ✅ **When the mentor leaves**, all students are redirected to the Lobby.
- ✅ **Clear user interface** with separation between Mentor and Students views.

---

Technologies Used
- **React** + **React Router**
- **FastAPI** (Python server)
- **Firebase Firestore** (database)
- **WebSockets** for real-time communication
- **react-simple-code-editor** and **PrismJS** for syntax highlighting


## Setup Instructions

## Frontend (React):
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app locally:
   ```bash
   npm start
   ```

## Backend (FastAPI):
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # (Linux/Mac)
   venv\Scripts\activate  # (Windows)
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```


## Deployment
The project is deployed using:
- **Vercel** for the frontend (React)
- **Railway.app** for the backend (FastAPI)

# 🎯 Submission
- Frontend deployed: [Insert Vercel URL here]
- Backend deployed: [Insert Railway or other server URL here]
- GitHub repository: [Insert GitHub repo link here]
