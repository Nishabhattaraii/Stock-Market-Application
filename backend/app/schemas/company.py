from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CompanyBase(BaseModel):
    symbol: str
    name: str
    sector: str
    is_active: bool = True
    ltp: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    volume: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    avg_120_days: Optional[float] = None
    avg_180_days: Optional[float] = None
    latest_bonus_dividend: Optional[float] = None
    latest_cash_dividend: Optional[float] = None
    latest_right_share: Optional[float] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyOut(CompanyBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

