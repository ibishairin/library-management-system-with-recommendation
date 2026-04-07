"""
Script to create an admin user in the database.
Run this script directly: python create_admin.py
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import bcrypt


def hash_password(password: str):
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def create_admin(username: str, password: str):
    """Create an admin user in the database."""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(models.User).filter(
            models.User.username == username
        ).first()
        
        if existing_user:
            print(f"User '{username}' already exists!")
            
            # Update role to admin if user exists
            if existing_user.role != "admin":
                existing_user.role = "admin"
                db.commit()
                print(f"User '{username}' has been updated to admin!")
            else:
                print(f"User '{username}' is already an admin!")
            return
        
        # Create new admin user
        hashed_password = hash_password(password)
        
        new_admin = models.User(
            username=username,
            password=hashed_password,
            role="admin"
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        print(f"Admin user '{username}' created successfully!")
        print(f"User ID: {new_admin.id}")
        print(f"Role: {new_admin.role}")
        
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=engine)
    
    # Default admin credentials
    admin_username = "admin"
    admin_password = "admin123"
    
    print("=" * 50)
    print("Creating Admin User")
    print("=" * 50)
    print(f"Username: {admin_username}")
    print(f"Password: {admin_password}")
    print("=" * 50)
    
    create_admin(admin_username, admin_password)
    
    print("\nYou can now login with:")
    print(f"  Username: {admin_username}")
    print(f"  Password: {admin_password}")
