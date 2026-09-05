from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

class DailyPriceOut(BaseModel):
    id: int
    company_id: int
    trading_date: date
    open: float
    high: float
    low: float
    close: float
    volume: float
    turnover: Optional[float] = None
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

class FloorsheetOut(BaseModel):
    id: int
    company_id: int
    trading_date: date
    buyer_broker: int
    seller_broker: int
    quantity: float
    rate: float
    transaction_time: Optional[str] = None
    source: str

    class Config:
        from_attributes = True
