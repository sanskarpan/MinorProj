from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, confloat, field_validator, Field
from datetime import date, datetime

from app.models.budget import BudgetPeriod # Import the enum

class BudgetBase(BaseModel):
    name: str
    category: str
    amount: confloat(gt=0)
    period: BudgetPeriod
    start_date: date
    end_date: date

    @field_validator('end_date')
    @classmethod
    def end_date_after_start_date(cls, v, info):
        values = info.data
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[confloat(gt=0)] = None
    period: Optional[BudgetPeriod] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @field_validator('end_date')
    @classmethod
    def end_date_after_start_date_update(cls, v, info):
        # Simplified validation for partial updates
        values = info.data
        if v and values.get('start_date') and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class BudgetResponse(BudgetBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BudgetWithProgressResponse(BudgetResponse):
    spent_amount: float = 0.0
    remaining_amount: float = 0.0
    percentage_spent: float = 0.0
    is_over_budget: bool = False # For alerts
    days_left_in_period: Optional[int] = None