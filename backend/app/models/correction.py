from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class NewsCorrection(Base):
    __tablename__ = "news_corrections"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("news_articles.id", ondelete="CASCADE"), nullable=False, index=True)
    old_company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    new_company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    old_confidence = Column(Float, nullable=True)
    corrected_by = Column(String(100), nullable=False)
    correction_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    article = relationship("NewsArticle", back_populates="corrections")
