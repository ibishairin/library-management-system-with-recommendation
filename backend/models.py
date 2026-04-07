from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from sqlalchemy import Boolean

# ==============================
# BOOK MODEL
# ==============================

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)

    total_quantity = Column(Integer, default=1)
    available_quantity = Column(Integer, default=1)

    # 🔥 ADD THIS
    image_filename = Column(String, nullable=True)

    issues = relationship("Issue", back_populates="book")


# ==============================
# USER MODEL
# ==============================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="student")

    issues = relationship("Issue", back_populates="user")


# ==============================
# ISSUE MODEL
# ==============================
class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))

    issued_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    returned_at = Column(DateTime, nullable=True)

    fine = Column(Float, default=0.0)

    # 🔥 NEW
    fine_paid = Column(Boolean, default=False)
    renew_count = Column(Integer, default=0)

    user = relationship("User", back_populates="issues")
    book = relationship("Book", back_populates="issues")