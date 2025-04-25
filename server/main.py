from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
