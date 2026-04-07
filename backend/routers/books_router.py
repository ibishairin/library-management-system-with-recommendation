from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import models, schemas
from database import SessionLocal
from auth import get_current_user, get_current_admin

router = APIRouter(prefix="/books", tags=["Books"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=schemas.Book)
def add_book(
    title: str = Form(...),
    author: str = Form(...),
    quantity: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    image_filename = None

    if image:
        image_filename = image.filename
        file_path = os.path.join("uploads", image_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    db_book = models.Book(
        title=title,
        author=author,
        total_quantity=quantity,
        available_quantity=quantity,
        image_filename=image_filename
    )

    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@router.get("/", response_model=List[schemas.Book])
def get_books(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(models.Book).all()


@router.delete("/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}