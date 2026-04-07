from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


# =====================================================
# BOOK
# =====================================================

class Book(BaseModel):
    id: int
    title: str
    author: str
    total_quantity: int
    available_quantity: int
    image_filename: Optional[str] = None

    class Config:
        from_attributes = True


class BookCreate(BaseModel):
    title: str
    author: str
    quantity: int


# =====================================================
# USER SCHEMAS
# =====================================================

class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# =====================================================
# NESTED SAFE MODELS (FOR ISSUES)
# =====================================================

class UserBasic(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class BookBasic(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


# =====================================================
# ISSUE (NESTED RESPONSE)
# =====================================================

class IssueResponse(BaseModel):
    id: int
    issued_at: datetime
    due_date: datetime
    returned_at: Optional[datetime] = None
    fine: float
    fine_paid: bool
    renew_count: int

    user: UserBasic
    book: BookBasic

    class Config:
        from_attributes = True


# =====================================================
# DASHBOARD
# =====================================================

class DashboardOverview(BaseModel):
    total_books: int
    total_students: int
    active_issues: int
    overdue_books: int
    total_fines: float


class MostBorrowedBook(BaseModel):
    title: str
    borrow_count: int


class MonthlyIssue(BaseModel):
    month: str
    count: int


class AdminDashboardResponse(BaseModel):
    overview: DashboardOverview
    most_borrowed_books: List[MostBorrowedBook]
    monthly_issues: List[MonthlyIssue]
