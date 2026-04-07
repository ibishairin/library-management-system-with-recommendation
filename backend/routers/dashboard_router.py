# dashboard_router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import models, schemas
from database import SessionLocal
from auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Dashboard"])

FINE_RATE = 5  # ₹ per day


# =========================
# DB DEPENDENCY
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# ADMIN DASHBOARD
# =========================
@router.get("/dashboard", response_model=schemas.AdminDashboardResponse)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    today = datetime.utcnow()

    # -------------------------
    # BASIC COUNTS
    # -------------------------
    total_books = db.query(models.Book).count()

    total_students = db.query(models.User).filter(
        models.User.role == "student"
    ).count()

    active_issues = db.query(models.Issue).filter(
        models.Issue.returned_at == None
    ).count()

    overdue_count = db.query(models.Issue).filter(
        models.Issue.returned_at == None,
        models.Issue.due_date < today
    ).count()

    # -------------------------
    # FROZEN FINES (RETURNED)
    # -------------------------
    frozen_outstanding_fines = db.query(
        func.sum(models.Issue.fine - models.Issue.fine_paid)
    ).scalar() or 0

    # -------------------------
    # ACTIVE OVERDUE FINES (DYNAMIC)
    # -------------------------
    active_overdue_issues = db.query(models.Issue).filter(
        models.Issue.returned_at == None,
        models.Issue.due_date < today
    ).all()

    active_overdue_fine = sum(
        max(0, (today - issue.due_date).days) * FINE_RATE
        for issue in active_overdue_issues
    )

    total_fines = frozen_outstanding_fines + active_overdue_fine

    # -------------------------
    # MOST BORROWED BOOKS
    # -------------------------
    most_borrowed = (
        db.query(
            models.Book.title,
            func.count(models.Issue.id).label("borrow_count")
        )
        .join(models.Issue)
        .group_by(models.Book.title)
        .order_by(func.count(models.Issue.id).desc())
        .limit(5)
        .all()
    )

    # -------------------------
    # MONTHLY ISSUES (SQLite Compatible)
    # -------------------------
    monthly_issues = (
        db.query(
            func.strftime("%Y-%m", models.Issue.issued_at).label("month"),
            func.count(models.Issue.id).label("count")
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    # -------------------------
    # RESPONSE
    # -------------------------
    return {
        "overview": {
            "total_books": total_books,
            "total_students": total_students,
            "active_issues": active_issues,
            "overdue_books": overdue_count,
            "total_fines": total_fines
        },
        "most_borrowed_books": [
            {
                "title": book.title,
                "borrow_count": book.borrow_count
            }
            for book in most_borrowed
        ],
        "monthly_issues": [
            {
                "month": item.month,
                "count": item.count
            }
            for item in monthly_issues
        ]
    }