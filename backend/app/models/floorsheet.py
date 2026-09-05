from datetime import datetime
from sqlalchemy import Column, Integer, Float, Date, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class FloorsheetTransaction(Base):
    __tablename__ = "floorsheet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    trading_date = Column(Date, nullable=False, index=True)
    buyer_broker = Column(Integer, nullable=False, index=True)
    seller_broker = Column(Integer, nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    rate = Column(Float, nullable=False)
    transaction_time = Column(String(20), nullable=True)
    source = Column(String(50), default="nepse_floorsheet")

    company = relationship("Company", back_populates="floorsheets")
