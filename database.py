from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["ai_notes"]

users_collection = db["users"]
notes_collection = db["notes"]

print("MongoDB Connected")