from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
import models
from database import SessionLocal
from auth import get_current_user

router = APIRouter(prefix="/student", tags=["Student"])

FINE_RATE = 5  # ₹ per day
MAX_RENEW = 2


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# STUDENT DASHBOARD
# =====================================================
@router.get("/dashboard")
def student_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = datetime.utcnow()

    active_issues = db.query(models.Issue).options(
        joinedload(models.Issue.book)
    ).filter(
        models.Issue.user_id == current_user.id,
        models.Issue.returned_at == None
    ).all()

    history = db.query(models.Issue).options(
        joinedload(models.Issue.book)
    ).filter(
        models.Issue.user_id == current_user.id,
        models.Issue.returned_at != None
    ).all()

    active_books = []
    overdue_count = 0
    pending_fine = 0

    for issue in active_issues:
        is_overdue = issue.due_date < today

        fine = 0
        if is_overdue:
            days_late = (today - issue.due_date).days
            fine = days_late * FINE_RATE
            overdue_count += 1
            pending_fine += fine

            # Persist fine into DB (important)
            issue.fine = fine
        else:
            issue.fine = 0

        can_renew = (
            not is_overdue
            and issue.renew_count < MAX_RENEW
            and issue.fine_paid is False
        )

        active_books.append({
            "issue_id": issue.id,
            "title": issue.book.title,
            "due_date": issue.due_date,
            "is_overdue": is_overdue,
            "current_fine": fine,
            "renew_count": issue.renew_count,
            "can_renew": can_renew,
            "fine_paid": issue.fine_paid
        })

    db.commit()  # persist fine updates

    borrow_history = [
        {
            "title": issue.book.title,
            "returned_at": issue.returned_at,
            "fine": issue.fine,
            "fine_paid": issue.fine_paid
        }
        for issue in history
    ]

    return {
        "active_books": active_books,
        "borrow_history": borrow_history,
        "stats": {
            "total_borrowed": len(active_books) + len(history),
            "overdue_books": overdue_count,
            "pending_fine": pending_fine,
            "active_books": len(active_books)
        }
    }


# =====================================================
# RENEW BOOK
# =====================================================
@router.post("/renew/{issue_id}")
def renew_book(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    issue = db.query(models.Issue).filter(
        models.Issue.id == issue_id,
        models.Issue.user_id == current_user.id,
        models.Issue.returned_at == None
    ).first()

    if not issue:
        raise HTTPException(status_code=404, detail="Active issue not found")

    if issue.due_date < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Cannot renew overdue book")

    if issue.renew_count >= MAX_RENEW:
        raise HTTPException(status_code=400, detail="Renew limit reached")

    if issue.fine > 0 and not issue.fine_paid:
        raise HTTPException(status_code=400, detail="Pay fine before renewal")

    issue.due_date += timedelta(days=7)
    issue.renew_count += 1

    db.commit()

    return {
        "message": "Renewed successfully",
        "renew_count": issue.renew_count,
        "new_due_date": issue.due_date
    }


# =====================================================
# PAY FINE
# =====================================================
@router.post("/pay-fine/{issue_id}")
def pay_fine(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    issue = db.query(models.Issue).filter(
        models.Issue.id == issue_id,
        models.Issue.user_id == current_user.id
    ).first()

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if issue.fine <= 0:
        raise HTTPException(status_code=400, detail="No fine to pay")

    issue.fine_paid = True

    db.commit()

    return {"message": "Fine paid successfully"}