from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, auth
from database import SessionLocal
from auth import get_current_user

router = APIRouter(tags=["Auth"])


# =========================
# DB DEPENDENCY
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ======================================================
# REGISTER (STUDENT ONLY - PUBLIC)
# ======================================================
@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = auth.hash_password(user.password)

    new_user = models.User(
        username=user.username,
        password=hashed_password,
        role="student"   # 🔥 FORCE ROLE
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# ======================================================
# LOGIN
# ======================================================
@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = auth.authenticate_user(db, user.username, user.password)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth.create_access_token(
        data={"sub": db_user.username, "role": db_user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ======================================================
# CREATE ADMIN (PROTECTED)
# ======================================================
@router.post("/create-admin")
def create_admin(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    existing = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = auth.hash_password(user.password)

    new_admin = models.User(
        username=user.username,
        password=hashed_password,
        role="admin"
    )

    db.add(new_admin)
    db.commit()

    return {"message": "Admin created successfully"}