from datetime import datetime
from sqlalchemy import Column, Integer, Float, Date, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class AnalysisSnapshot(Base):
    __tablename__ = "analysis_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    analysis_date = Column(Date, nullable=False, index=True)
    vwap = Column(Float, nullable=True)
    close_price = Column(Float, nullable=True)
    buy_quantity = Column(Float, default=0.0)
    sell_quantity = Column(Float, default=0.0)
    pressure_score = Column(Float, default=0.0) # (buy - sell)/(buy + sell)
    volume_average = Column(Float, default=0.0)
    volume_anomaly = Column(Boolean, default=False) # True if volume >= 2x volume_average
    news_count = Column(Integer, default=0)
    next_day_return = Column(Float, nullable=True)
    next_day_volume_change = Column(Float, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="analysis_snapshots")

    __table_args__ = (
        UniqueConstraint("company_id", "analysis_date", name="uix_company_analysis_date"),
    )
