import uuid
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base
from app.models.user import User # Import User for relationship

class BudgetPeriod(str, enum.Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"
    CUSTOM = "custom" # For specific date ranges

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False) # e.g., "Monthly Groceries", "Vacation Fund 2025"
    category = Column(String, nullable=False) # Corresponds to transaction categories
    amount = Column(Float, nullable=False)
    period = Column(SQLAlchemyEnum(BudgetPeriod), nullable=False, default=BudgetPeriod.MONTHLY)
    
    # For monthly/yearly, start_date could be the 1st of the month/year.
    # For custom, these define the budget's active period.
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="budgets")

    def __repr__(self):
        return f"<Budget {self.name} - {self.category}: {self.amount}>"

