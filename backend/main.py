from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine
import models

# Routers
from routers import (
    auth_router,
    books_router,
    issues_router,
    dashboard_router,
    users_router,
    student_router,
    recommendation_router  # ✅ ADD THIS
)

# =========================================================
# CREATE DATABASE TABLES
# =========================================================
models.Base.metadata.create_all(bind=engine)

# =========================================================
# APP INITIALIZATION
# =========================================================
app = FastAPI(title="Smart Library System API")

# =========================================================
# CORS CONFIGURATION
# =========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175"],  # Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# STATIC FILES (BOOK IMAGES)
# =========================================================
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# =========================================================
# INCLUDE ROUTERS
# =========================================================
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(books_router)
app.include_router(issues_router)
app.include_router(dashboard_router)
app.include_router(student_router)   # ✅ IMPORTANT
app.include_router(recommendation_router)

# =========================================================
# ROOT ENDPOINT
# =========================================================
@app.get("/")
def root():
    return {"message": "Smart Library System API is running"}