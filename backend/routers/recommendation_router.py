from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal
from auth import get_current_user
import models

router = APIRouter(tags=["Recommendations"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/recommend-user")
def recommend_books(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        # ---------------------------------------
        # 1️⃣ Get books user already borrowed
        # ---------------------------------------
        borrowed_books = db.query(models.Issue.book_id).filter(
            models.Issue.user_id == current_user.id
        ).all()

        borrowed_book_ids = [b.book_id for b in borrowed_books]

        # If user has no history → return top popular books
        if not borrowed_book_ids:
            popular_books = (
                db.query(
                    models.Book.id,
                    models.Book.title,
                    models.Book.author,
                    func.count(models.Issue.id).label("score")
                )
                .outerjoin(models.Issue)
                .group_by(models.Book.id)
                .order_by(func.count(models.Issue.id).desc())
                .limit(5)
                .all()
            )

            return [
                {
                    "id": book.id,
                    "title": book.title,
                    "author": book.author,
                    "score": book.score
                }
                for book in popular_books
            ]

        # ---------------------------------------
        # 2️⃣ Get authors user likes
        # ---------------------------------------
        liked_authors = (
            db.query(models.Book.author)
            .join(models.Issue)
            .filter(models.Issue.user_id == current_user.id)
            .distinct()
            .all()
        )

        liked_author_list = [a.author for a in liked_authors]

        # If no authors found from user's history, return popular books
        if not liked_author_list:
            popular_books = (
                db.query(
                    models.Book.id,
                    models.Book.title,
                    models.Book.author,
                    func.count(models.Issue.id).label("score")
                )
                .outerjoin(models.Issue)
                .group_by(models.Book.id)
                .order_by(func.count(models.Issue.id).desc())
                .limit(5)
                .all()
            )

            return [
                {
                    "id": book.id,
                    "title": book.title,
                    "author": book.author,
                    "score": book.score
                }
                for book in popular_books
            ]

        # ---------------------------------------
        # 3️⃣ Recommend books from same authors
        # ---------------------------------------
        recommended_books = (
            db.query(
                models.Book.id,
                models.Book.title,
                models.Book.author,
                func.count(models.Issue.id).label("score")
            )
            .outerjoin(models.Issue)
            .filter(
                models.Book.author.in_(liked_author_list),
                ~models.Book.id.in_(borrowed_book_ids)
            )
            .group_by(models.Book.id)
            .order_by(func.count(models.Issue.id).desc())
            .limit(5)
            .all()
        )

        # If no recommendations from same authors, return popular books
        if not recommended_books:
            popular_books = (
                db.query(
                    models.Book.id,
                    models.Book.title,
                    models.Book.author,
                    func.count(models.Issue.id).label("score")
                )
                .outerjoin(models.Issue)
                .filter(~models.Book.id.in_(borrowed_book_ids))
                .group_by(models.Book.id)
                .order_by(func.count(models.Issue.id).desc())
                .limit(5)
                .all()
            )

            return [
                {
                    "id": book.id,
                    "title": book.title,
                    "author": book.author,
                    "score": book.score
                }
                for book in popular_books
            ]

        return [
            {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "score": book.score
            }
            for book in recommended_books
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")
