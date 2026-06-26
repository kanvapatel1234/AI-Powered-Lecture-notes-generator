# 🎓 AI Notes Generator

An AI-powered application that converts YouTube educational videos into structured study notes using Large Language Models (LLMs). The application extracts video transcripts, generates different styles of notes, and stores user-specific history using JWT authentication and MongoDB.

---

# Features

* User Registration & Login
* JWT Authentication
* Generate AI Notes from YouTube Videos
* Three Note Modes

  * Interview Oriented
  * Short Revision Notes
  * Exam Oriented Notes
* YouTube Transcript Extraction
* OpenAI GPT-4o-mini Integration
* MongoDB Storage
* User-specific Note History
* REST API using FastAPI

---

# Tech Stack

## Backend

* FastAPI
* Python
* OpenAI API
* YouTube Transcript API
* MongoDB
* PyMongo
* JWT
* Bcrypt

## Database

* MongoDB Community Edition

## Authentication

* JWT Tokens
* Password Hashing using Bcrypt

---

# Project Structure

```text
AI_ASSISTANT/

│── app.py
│── database.py
│── .env
│── requirements.txt

├── models/
│   └── user_model.py

├── services/
│   ├── auth_service.py
│   ├── captions.py
│   └── summarizer.py
```

---

# API Endpoints

## Authentication

### Register

```
POST /register
```

Creates a new user account.

---

### Login

```
POST /login
```

Authenticates the user and returns a JWT token.

---

## Notes

### Generate Notes

```
POST /generate-notes
```

Input

* YouTube URL
* Note Mode
* JWT Token

Generates AI notes and stores them in MongoDB.

---

### My Notes

```
GET /my-notes
```

Returns all notes belonging to the logged-in user.

---

### Get Note

```
GET /note/{id}
```

Returns the complete generated note using its unique note ID.

---

# Note Types

## Interview Mode

Generates

* Important Concepts
* Interview Questions
* Answers
* Follow-up Questions
* Real-world Use Cases

---

## Short Notes

Generates

* Key Concepts
* Important Points
* Quick Revision Notes

---

## Exam Mode

Generates

* Definitions
* Important Concepts
* Short Answer Questions
* Long Answer Questions
* Revision Notes

---

# Workflow

```text
User Login
      │
      ▼
Receive JWT Token
      │
      ▼
Enter YouTube URL
      │
      ▼
Extract Transcript
      │
      ▼
Send Transcript to GPT-4o-mini
      │
      ▼
Generate Notes
      │
      ▼
Store Notes in MongoDB
      │
      ▼
Retrieve Personal History
```

---

# MongoDB Collections

## users

```json
{
  "_id": "...",
  "name": "Kanva",
  "email": "kanva@gmail.com",
  "password": "hashed_password"
}
```

---

## notes

```json
{
  "_id": "...",
  "user_id": "...",
  "video_id": "...",
  "video_url": "...",
  "mode": "interview",
  "notes": "Generated AI Notes"
}
```

---

# Environment Variables

Create a `.env` file inside the project root.

```env
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_secret_key
```

---

# Installation

Clone the repository

```bash
git clone <repository_url>
```

Create virtual environment

```bash
python -m venv venv
```

Activate virtual environment

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Start MongoDB Community Server.

Run the FastAPI server

```bash
uvicorn app:app --reload
```

API Documentation

```
http://127.0.0.1:8000/docs
```

---

# Future Improvements

* Responsive Frontend
* Download Notes as TXT/PDF
* Multiple LLM Support
* Video Title & Thumbnail Integration
* Search Notes
* Delete Notes
* Update Notes
* Dark Mode
* Chat with Generated Notes (RAG)
* Voice Input
* Multi-language Support

---

# Author

**Kanva V Patel**

Electronics & Communication Engineering

Backend Developer | AI Enthusiast | MERN & FastAPI Learner
