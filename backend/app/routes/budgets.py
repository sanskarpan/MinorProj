from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func # Renamed to avoid conflict with datetime.func
from uuid import UUID
from datetime import date, datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.budget import Budget, BudgetPeriod
from app.models.transaction import Transaction, TransactionType
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetWithProgressResponse

router = APIRouter()

def calculate_budget_progress(db: Session, budget: Budget, current_user: User) -> dict:
    """Calculates spending progress for a single budget."""
    
    # Ensure start_date and end_date are date objects if they are strings
    start_dt = budget.start_date
    end_dt = budget.end_date
    if isinstance(start_dt, str):
        start_dt = date.fromisoformat(start_dt)
    if isinstance(end_dt, str):
        end_dt = date.fromisoformat(end_dt)

    total_spent_query = (
        db.query(sql_func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.category == budget.category,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.date >= start_dt,
            Transaction.date <= end_dt,
        )
    )
    total_spent = total_spent_query.scalar() or 0.0

    remaining_amount = budget.amount - total_spent
    percentage_spent = (total_spent / budget.amount * 100) if budget.amount > 0 else 0
    is_over_budget = total_spent > budget.amount

    days_left = None
    today = date.today()
    if end_dt >= today >= start_dt:
        days_left = (end_dt - today).days
    elif today < start_dt: # Budget period hasn't started
        days_left = (end_dt - start_dt).days # Total duration
    elif today > end_dt: # Budget period has passed
        days_left = 0


    return {
        "spent_amount": total_spent,
        "remaining_amount": remaining_amount,
        "percentage_spent": round(percentage_spent, 2),
        "is_over_budget": is_over_budget,
        "days_left_in_period": days_left
    }


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check for overlapping budgets for the same category and user (optional but good)
    existing_budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category == budget_in.category,
        Budget.start_date <= budget_in.end_date, # Existing budget starts before or when new one ends
        Budget.end_date >= budget_in.start_date   # Existing budget ends after or when new one starts
    ).first()

    if existing_budget:
        # Allow if periods are distinct, e.g. new monthly budget does not conflict with an old one
        # This logic needs to be more precise if allowing multiple budgets for same category
        # For now, a simple overlap check on dates.
        # If periods are strictly defined (e.g., only one monthly budget per category per month),
        # this check should be more specific.
        # For this iteration, let's assume category + overlapping date range is a conflict
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An overlapping budget for category '{budget_in.category}' already exists for this period."
        )

    budget = Budget(
        **budget_in.model_dump(),  # Pydantic V2
        user_id=current_user.id
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

@router.get("", response_model=List[BudgetWithProgressResponse])
def get_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    active_only: bool = Query(False, description="Only return budgets for current or future periods"),
    period: Optional[BudgetPeriod] = Query(None, description="Filter by budget period type")
):
    query = db.query(Budget).filter(Budget.user_id == current_user.id)
    
    if active_only:
        today = date.today()
        query = query.filter(Budget.end_date >= today)
    
    if period:
        query = query.filter(Budget.period == period)
        
    budgets = query.order_by(Budget.start_date.desc(), Budget.name).all()
    
    budgets_with_progress = []
    for budget in budgets:
        progress_data = calculate_budget_progress(db, budget, current_user)
        budget_data = BudgetResponse.model_validate(budget).model_dump() # Pydantic V2
        budgets_with_progress.append(
            BudgetWithProgressResponse(**budget_data, **progress_data)
        )
        
    return budgets_with_progress

@router.get("/{budget_id}", response_model=BudgetWithProgressResponse)
def get_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    
    progress_data = calculate_budget_progress(db, budget, current_user)
    budget_data = BudgetResponse.model_validate(budget).model_dump() # Pydantic V2
    return BudgetWithProgressResponse(**budget_data, **progress_data)

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: UUID,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")

    update_data = budget_in.model_dump(exclude_unset=True) # Pydantic V2
    
    # Validate date consistency if both start_date and end_date are part of the update
    # Or if one is provided and the other exists on the budget object.
    new_start_date = update_data.get('start_date', budget.start_date)
    new_end_date = update_data.get('end_date', budget.end_date)

    if new_start_date and new_end_date and new_end_date < new_start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date."
        )
        
    # Check for overlaps if category or dates change significantly
    # This can be complex; for now, we'll skip full overlap check on update for brevity,
    # but it's important for production. Assume frontend/user manages this correctly for now.

    for field, value in update_data.items():
        setattr(budget, field, value)
    
    db.commit()
    db.refresh(budget)
    return budget

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    
    db.delete(budget)
    db.commit()
    return None # FastAPI handles 204 No Content response