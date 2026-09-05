from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.company import CompanyOut

class AnalysisSnapshotOut(BaseModel):
    id: int
    company_id: int
    analysis_date: date
    vwap: Optional[float] = None
    close_price: Optional[float] = None
    buy_quantity: float
    sell_quantity: float
    pressure_score: float
    volume_average: float
    volume_anomaly: bool
    news_count: int
    next_day_return: Optional[float] = None
    next_day_volume_change: Optional[float] = None
    generated_at: datetime
    company: Optional[CompanyOut] = None

    class Config:
        from_attributes = True

class BrokerBreakdownItem(BaseModel):
    broker_id: int
    buy_quantity: float
    sell_quantity: float
    net_quantity: float
    transaction_count: int
    percentage_contribution: float

class BrokerBreakdownOut(BaseModel):
    company_id: int
    trading_date: date
    top_buyers: List[BrokerBreakdownItem]
    top_sellers: List[BrokerBreakdownItem]

class CompanyComparisonItem(BaseModel):
    company: CompanyOut
    latest_close: Optional[float] = None
    close_return_pct: Optional[float] = None
    avg_volume: float
    volume_anomaly: bool
    news_count_30d: int
    pressure_score: float

class ComparisonOut(BaseModel):
    companies: List[CompanyComparisonItem]

class CompanyAnalysisDetail(BaseModel):
    company: CompanyOut
    latest_snapshot: Optional[AnalysisSnapshotOut] = None
    snapshots: List[AnalysisSnapshotOut] = []
    broker_breakdown: Optional[BrokerBreakdownOut] = None
    vwap_comparison: List[dict] = [] # date, vwap, close
