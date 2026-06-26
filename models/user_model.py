from pydantic import BaseModel


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str
    
class NotesRequest(BaseModel):
    url: str
    mode: str
    token: str