from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user
)
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin, UserUpdate

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user
    """
    # Check if the user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create the user
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        name=user_in.name,
        password=hashed_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

#Authentication Flow
@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Check if the user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check the password
    if not verify_password(user_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create the access token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.put("/me", response_model=UserResponse)
async def update_current_user_info(
    user_in: UserUpdate, # Use UserUpdate schema
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's information (e.g., name).
    Password updates should be handled via a separate, more secure endpoint.
    Email updates also require verification, so handled separately if needed.
    """
    if user_in.name is not None:
        current_user.name = user_in.name
    
    # For email changes: typically requires re-verification.
    if user_in.email is not None and user_in.email != current_user.email:
        # Check if new email is already taken
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered by another user.")
        current_user.email = user_in.email # Add email verification flow later if needed
        # Potentially mark email as unverified until confirmed

    # For password changes:
    if user_in.password is not None:
        # This is a simplified password update. A real system would ask for current password.
        # Consider a dedicated /change-password endpoint.
        current_user.password = get_password_hash(user_in.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


