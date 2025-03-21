from datetime import datetime, timedelta
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionAnalytics

router = APIRouter()

@router.get("", response_model=TransactionAnalytics)
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    timeframe: str = "month",  # month, quarter, year
):
    """
    Get analytics for a user
    """
    # Get all transactions for the user
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .all()
    )
    
    # Calculate monthly summary
    monthly_summary = calculate_monthly_summary(transactions, timeframe)
    
    # Calculate category breakdown
    category_breakdown = calculate_category_breakdown(transactions)
    
    # Calculate income vs expense
    income_vs_expense = calculate_income_vs_expense(transactions)
    
    return {
        "monthly_summary": monthly_summary,
        "category_breakdown": category_breakdown,
        "income_vs_expense": income_vs_expense,
    }

def calculate_monthly_summary(transactions, timeframe):
    """
    Calculate monthly summary
    """
    # Determine number of months to include
    months_to_include = 6
    if timeframe == "quarter":
        months_to_include = 12
    elif timeframe == "year":
        months_to_include = 24
    
    # Get date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30 * months_to_include)
    
    # Group transactions by month
    monthly_data = defaultdict(lambda: {"income": 0, "expense": 0, "net": 0})
    
    for transaction in transactions:
        # Skip transactions outside the date range
        transaction_date = datetime.combine(transaction.date, datetime.min.time())
        if transaction_date < start_date:
            continue
        
        # Format month key
        month_key = transaction_date.strftime("%b %Y")
        
        # Add to monthly data
        if transaction.type == "income":
            monthly_data[month_key]["income"] += transaction.amount
        else:
            monthly_data[month_key]["expense"] += transaction.amount
        monthly_data[month_key]["net"] = monthly_data[month_key]["income"] - monthly_data[month_key]["expense"]
    
    # Convert to list and sort by date
    monthly_summary = []
    for month, data in monthly_data.items():
        monthly_summary.append({
            "month": month,
            **data
        })
    
    # Sort by date
    monthly_summary.sort(key=lambda x: datetime.strptime(x["month"], "%b %Y"))
    
    return monthly_summary

def calculate_category_breakdown(transactions):
    """
    Calculate category breakdown
    """
    # Filter expense transactions
    expense_transactions = [t for t in transactions if t.type == "expense"]
    
    # Group by category
    category_totals = defaultdict(float)
    for transaction in expense_transactions:
        category_totals[transaction.category] += transaction.amount
    
    # Calculate total expense
    total_expense = sum(category_totals.values())
    
    # Calculate percentages
    category_breakdown = []
    for category, amount in category_totals.items():
        percentage = (amount / total_expense * 100) if total_expense > 0 else 0
        category_breakdown.append({
            "name": category,
            "amount": amount,
            "percentage": round(percentage, 2),
        })
    
    # Sort by amount
    category_breakdown.sort(key=lambda x: x["amount"], reverse=True)
    
    return category_breakdown

def calculate_income_vs_expense(transactions):
    """
    Calculate income vs expense
    """
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    net = total_income - total_expense
    
    return {
        "income": total_income,
        "expense": total_expense,
        "net": net,
    }