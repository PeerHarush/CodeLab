from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
import asyncio
import json  # חדש! נוסיף בשביל לקרוא הודעות JSON

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connections = {}

async def broadcast_students_count(code_block_id):
    if code_block_id in connections:
        message = {"students": len(connections[code_block_id])}
        for ws in connections[code_block_id]:
            await ws.send_json(message)

@app.websocket("/ws/{code_block_id:path}")
async def websocket_endpoint(websocket: WebSocket, code_block_id: str):
    await websocket.accept()

    if code_block_id not in connections:
        connections[code_block_id] = []

    connections[code_block_id].append(websocket)

    try:
        await broadcast_students_count(code_block_id)

        if len(connections[code_block_id]) == 1:
            await websocket.send_json({"role": "mentor"})
        else:
            await websocket.send_json({"role": "student"})

        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("action") == "mentor_left":
                    # שלח לכל הסטודנטים שיעברו ללובי
                    for ws in connections[code_block_id]:
                        if ws != websocket:
                            await ws.send_json({"action": "mentor_left"})
                    connections[code_block_id].clear()
                    break  # מנתק את המנטור עצמו גם כן
            except Exception as e:
                print(f"Error handling websocket message: {e}")

    except WebSocketDisconnect:
        if code_block_id in connections and websocket in connections[code_block_id]:
            connections[code_block_id].remove(websocket)
            if not connections[code_block_id]:
                del connections[code_block_id]
            else:
                await broadcast_students_count(code_block_id)

# FIREBASE setup
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

class AnswerRequest(BaseModel):
    question_name: str
    user_code: str

@app.post("/check-answer")
async def check_answer(request: AnswerRequest):
    doc_ref = db.collection("code_blocks").document(request.question_name)
    doc = doc_ref.get()

    if not doc.exists:
        return {"result": "error", "message": "question not found"}

    correct_solution = doc.to_dict().get("solution_code")

    if correct_solution is None:
        return {"result": "error", "message": "solution not found"}

    if request.user_code.strip() == correct_solution.strip():
        return {"result": "correct"}
    else:
        return {"result": "incorrect"}
