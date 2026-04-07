from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import List
import models, schemas
from database import SessionLocal
from auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Issues"])


# =========================
# DB Dependency
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# GET ALL ISSUES (SIMPLIFIED)
# =====================================================
@router.get("/issues")
def get_all_issues(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    try:
        issues = (
            db.query(models.Issue)
            .options(
                joinedload(models.Issue.user),
                joinedload(models.Issue.book)
            )
            .all()
        )
        
        # Return simplified response
        result = []
        for issue in issues:
            result.append({
                "id": issue.id,
                "user_id": issue.user_id,
                "book_id": issue.book_id,
                "issued_at": issue.issued_at.isoformat() if issue.issued_at else None,
                "due_date": issue.due_date.isoformat() if issue.due_date else None,
                "returned_at": issue.returned_at.isoformat() if issue.returned_at else None,
                "fine": issue.fine,
                "fine_paid": issue.fine_paid,
                "renew_count": issue.renew_count,
                "user_name": issue.user.username if issue.user else "Unknown",
                "book_title": issue.book.title if issue.book else "Unknown"
            })
        
        return result
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error in get_all_issues: {e}")
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# ISSUE BOOK
# =====================================================
@router.post("/issue")
def admin_issue_book(
    student_id: int,
    book_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    # 🔍 Validate Book
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # 🔍 Validate Student
    student = db.query(models.User).filter(models.User.id == student_id).first()
    if not student or student.role != "student":
        raise HTTPException(status_code=404, detail="Student not found")

    # 🚫 Prevent issuing if unavailable
    if book.available_quantity <= 0:
        raise HTTPException(status_code=400, detail="Book not available")

    # 🚫 Prevent duplicate issue
    existing_issue = db.query(models.Issue).filter(
        models.Issue.user_id == student_id,
        models.Issue.book_id == book_id,
        models.Issue.returned_at == None
    ).first()

    if existing_issue:
        raise HTTPException(status_code=400, detail="Book already issued to this student")

    # 📅 Set Due Date
    due_date = datetime.utcnow() + timedelta(days=7)

    issue = models.Issue(
        user_id=student_id,
        book_id=book_id,
        issued_at=datetime.utcnow(),
        due_date=due_date,
        fine=0.0
    )

    book.available_quantity -= 1

    db.add(issue)
    db.commit()
    db.refresh(issue)

    return {"message": "Book issued successfully"}


# =====================================================
# RETURN BOOK
# =====================================================
@router.post("/return/{issue_id}")
def admin_return_book(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if issue.returned_at:
        raise HTTPException(status_code=400, detail="Book already returned")

    return_time = datetime.utcnow()
    issue.returned_at = return_time

    # 💰 Fine calculation
    if return_time > issue.due_date:
        overdue_days = (return_time - issue.due_date).days
        issue.fine = overdue_days * 5
    else:
        issue.fine = 0.0

    # 📦 Increase book availability
    book = db.query(models.Book).filter(models.Book.id == issue.book_id).first()
    book.available_quantity += 1

    db.commit()

    return {
        "message": "Book returned successfully",
        "fine": issue.fine
    }

@router.post("/pay-fine/{issue_id}")
def pay_fine(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    issue = db.query(models.Issue).filter(
        models.Issue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if issue.fine <= 0:
        raise HTTPException(status_code=400, detail="No fine to pay")

    issue.fine_paid = True

    db.commit()

    return {"message": "Fine marked as paid"}