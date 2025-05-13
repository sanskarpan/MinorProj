from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, validator, confloat, field_validator
from datetime import date, datetime

from app.models.transaction import TransactionType

# Shared properties
class TransactionBase(BaseModel):
    description: str
    amount: confloat(gt=0)  # positive float
    date: date
    type: TransactionType
    category: str
    notes: Optional[str] = None

# Properties to receive via API on creation
class TransactionCreate(TransactionBase):
    pass

# Properties to receive via API on update
class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[confloat(gt=0)] = None
    date: Optional[date] = None
    type: Optional[TransactionType] = None
    category: Optional[str] = None
    notes: Optional[str] = None

# Properties to return to client
class TransactionResponse(TransactionBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# Properties properties stored in DB
class TransactionInDB(TransactionResponse):
    updated_at: datetime

# Transaction summary
class TransactionSummary(BaseModel):
    total_income: float
    total_expense: float
    net_balance: float
    categories: List[dict]
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_income": 5000.0,
                "total_expense": 3000.0,
                "net_balance": 2000.0,
                "categories": [
                    {"name": "food", "amount": 1000.0, "percentage": 33.33},
                    {"name": "transport", "amount": 500.0, "percentage": 16.67},
                    {"name": "utilities", "amount": 1500.0, "percentage": 50.0},
                ]
            }
        }

# Transaction analytics
class TransactionAnalytics(BaseModel):
    monthly_summary: List[dict]
    category_breakdown: List[dict]
    income_vs_expense: dict
    
    class Config:
        json_schema_extra = {
            "example": {
                "monthly_summary": [
                    {"month": "Jan 2023", "income": 5000.0, "expense": 3000.0, "net": 2000.0},
                    {"month": "Feb 2023", "income": 5200.0, "expense": 3100.0, "net": 2100.0},
                ],
                "category_breakdown": [
                    {"name": "food", "amount": 1000.0, "percentage": 33.33},
                    {"name": "transport", "amount": 500.0, "percentage": 16.67},
                    {"name": "utilities", "amount": 1500.0, "percentage": 50.0},
                ],
                "income_vs_expense": {
                    "income": 10200.0,
                    "expense": 6100.0,
                    "net": 4100.0
                }
            }
        }