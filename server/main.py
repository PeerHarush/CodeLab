from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
import asyncio
import json

app = FastAPI()

# allow the frontend to communicate with the backend
#  without being blocked, even if they are on different domains.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connections = {}
students_codes = {}

#The function sends all users connected to the 
# same code block the current number of connected students.
async def broadcast_students_count(code_block_id):
    if code_block_id in connections:
        message = {"students": len(connections[code_block_id])}
        for ws in connections[code_block_id]:
            await ws.send_json(message)

#The function sends the students' codes to the mentor so he can see them live
async def broadcast_all_codes(code_block_id):
    message = {"action": "update_all_codes", "codes": students_codes}   #create a dictionary with all the students codes
    if code_block_id in connections:
        for ws in connections[code_block_id]:
            await ws.send_json(message)

@app.websocket("/ws/{code_block_id:path}")
async def websocket_endpoint(websocket: WebSocket, code_block_id: str):
    await websocket.accept()
     # Accept the WebSocket connection.
    if code_block_id not in connections:
        connections[code_block_id] = []

    connections[code_block_id].append(websocket)

    try:
        await broadcast_students_count(code_block_id)
        # Notify all clients about the updated number of connected students.
        if len(connections[code_block_id]) == 1:
            await websocket.send_json({"role": "mentor"})    # If this is the first user, assign them the role of mentor.
        else:
            student_id = str(len(connections[code_block_id]) - 1)
            await websocket.send_json({"role": "student", "student_id": student_id})

        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("action") == "mentor_left":       # If the mentor leaves:
                    for ws in connections[code_block_id]:
                        if ws != websocket:
                            await ws.send_json({"action": "mentor_left"})
                            # Notify all other users that the mentor has left.
                    connections[code_block_id].clear()
                     # Clear all connections for this code block.
                    break
                elif message.get("action") == "update_code":
                    student_id = message.get("student_id")
                    code = message.get("code", "")
                    students_codes[student_id] = code
                     # Update the student's code in the storage.
                    await broadcast_all_codes(code_block_id)
            except Exception as e:
                print(f"Error handling websocket message: {e}")

    except WebSocketDisconnect:
        if code_block_id in connections and websocket in connections[code_block_id]:
            index = connections[code_block_id].index(websocket)
            connections[code_block_id].remove(websocket)
            # Remove the disconnected WebSocket from the list.
            if not connections[code_block_id]:
                del connections[code_block_id]
            await broadcast_students_count(code_block_id)

# FIREBASE setup
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

class AnswerRequest(BaseModel):
    question_name: str
    user_code: str




#The function checks if the user's code matches
# the correct solution and returns the result
@app.post("/check-answer")
async def check_answer(request: AnswerRequest):
    doc_ref = db.collection("code_blocks").document(request.question_name)
     # Get a reference to the document for the given question name.
  
    doc = doc_ref.get()
    # Retrieve the document from Firestore.
    if not doc.exists:
        return {"result": "error", "message": "question not found"}
        # If the document does not exist, return an error.

    correct_solution = doc.to_dict().get("solution_code")
    # Extract the correct solution code from the document.

    if correct_solution is None:
        return {"result": "error", "message": "solution not found"}

    if request.user_code.strip() == correct_solution.strip():
        return {"result": "correct"}
            # If the user's code matches the correct 
            # solution (ignoring spaces), return correct.
    else:
        return {"result": "incorrect"}
