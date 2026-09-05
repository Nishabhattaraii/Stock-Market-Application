from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    headline = Column(String(500), nullable=False)
    body = Column(Text, nullable=True)
    excerpt = Column(Text, nullable=True)
    published_at = Column(DateTime, nullable=False, index=True)
    source = Column(String(100), nullable=False, index=True)
    canonical_url = Column(String(500), unique=True, index=True, nullable=False)
    content_hash = Column(String(64), nullable=True)
    crawled_at = Column(DateTime, default=datetime.utcnow)

    tags = relationship("NewsCompanyTag", back_populates="article", cascade="all, delete-orphan")
    corrections = relationship("NewsCorrection", back_populates="article", cascade="all, delete-orphan")
