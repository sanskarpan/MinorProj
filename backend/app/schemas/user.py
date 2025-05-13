from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    name: str

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

# Properties to receive via API on update
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

# Properties to return to client
class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# Properties properties stored in DB
class UserInDB(UserResponse):
    password: str
    updated_at: datetime

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Login schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str