from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    sector = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Real-time metrics
    ltp = Column(Float, nullable=True)
    high = Column(Float, nullable=True)
    low = Column(Float, nullable=True)
    volume = Column(Float, nullable=True)
    fifty_two_week_high = Column(Float, nullable=True)
    fifty_two_week_low = Column(Float, nullable=True)
    avg_120_days = Column(Float, nullable=True)
    avg_180_days = Column(Float, nullable=True)
    latest_bonus_dividend = Column(Float, nullable=True)
    latest_cash_dividend = Column(Float, nullable=True)
    latest_right_share = Column(Float, nullable=True)

    prices = relationship("DailyPrice", back_populates="company", cascade="all, delete-orphan")
    floorsheets = relationship("FloorsheetTransaction", back_populates="company", cascade="all, delete-orphan")
    tags = relationship("NewsCompanyTag", back_populates="company", cascade="all, delete-orphan")
    analysis_snapshots = relationship("AnalysisSnapshot", back_populates="company", cascade="all, delete-orphan")

