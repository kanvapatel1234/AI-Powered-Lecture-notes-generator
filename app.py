from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from database import notes_collection
from services.captions import get_transcript
from services.summarizer import generate_notes
from models.user_model import RegisterRequest
from services.auth_service import hash_password
from database import users_collection
from models.user_model import LoginRequest
from models.user_model import NotesRequest
from services.auth_service import verify_token
from services.auth_service import (
    verify_password,
    create_token
)
from fastapi import Header
from bson import ObjectId
from services.auth_service import verify_token

app = FastAPI()

app.mount("/static", StaticFiles(directory="frontend"), name="static")


class NotesRequest(BaseModel):
    url: str
    mode: str
    token: str


@app.get("/")
def home():
    return FileResponse("frontend/index.html")


@app.post("/generate-notes")
def generate(request: NotesRequest):

    payload = verify_token(request.token)

    if not payload:
        return {
            "message": "Invalid Token"
        }

    user_id = payload["user_id"]

    mode_map = {
        "1": "interview",
        "2": "short",
        "3": "exam"
    }

    mode = mode_map.get(request.mode)

    if not mode:
        return {
            "error": "Invalid mode"
        }

    video_id, transcript = get_transcript(
        request.url
    )

    notes = generate_notes(
        video_id,
        transcript,
        mode
    )

    notes_collection.insert_one({
        "user_id": user_id,
        "video_id": video_id,
        "video_url": request.url,
        "mode": mode,
        "notes": notes
    })

    return {
        "message": "Notes saved successfully"
    }
@app.post("/register")
def register(request: RegisterRequest):

    existing_user = users_collection.find_one(
        {"email": request.email}
    )

    if existing_user:

        return {
            "message": "Email already exists"
        }

    hashed_password = hash_password(
        request.password
    )

    users_collection.insert_one({
        "name": request.name,
        "email": request.email,
        "password": hashed_password
    })

    return {
        "message": "User registered successfully"
    }

@app.post("/login")
def login(request: LoginRequest):

    user = users_collection.find_one(
        {"email": request.email}
    )

    if not user:

        return {
            "message": "User not found"
        }

    is_valid = verify_password(
        request.password,
        user["password"]
    )

    if not is_valid:

        return {
            "message": "Invalid password"
        }

    token = create_token(
        str(user["_id"])
    )

    return {
        "message": "Login successful",
        "token": token
    }

@app.get("/me")
def me(token: str):

    payload = verify_token(token)

    return payload

@app.get("/my-notes")
def my_notes(token: str):

    payload = verify_token(token)

    if not payload:
        return {
            "message": "Invalid Token"
        }

    user_id = payload["user_id"]

    notes = list(
        notes_collection.find(
            {"user_id": user_id},
            {"_id": 0}
        )
    )

    return notes

@app.get("/note/{note_id}")
def get_note(note_id: str):

    note = notes_collection.find_one(
        {"_id": ObjectId(note_id)}
    )

    return {
        "notes": note["notes"]
    }
