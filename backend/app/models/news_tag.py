from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class NewsCompanyTag(Base):
    __tablename__ = "news_company_tags"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("news_articles.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    confidence = Column(Float, nullable=False, default=1.0)
    method = Column(String(50), nullable=False, default="regex") # exact_symbol, exact_name, alias_match, manual_correction
    created_at = Column(DateTime, default=datetime.utcnow)

    article = relationship("NewsArticle", back_populates="tags")
    company = relationship("Company", back_populates="tags")

    __table_args__ = (
        UniqueConstraint("article_id", "company_id", name="uix_article_company_tag"),
    )
