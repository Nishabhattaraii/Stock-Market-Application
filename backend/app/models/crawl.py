from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class CrawlRun(Base):
    __tablename__ = "crawl_runs"

    id = Column(Integer, primary_key=True, index=True)
    portal = Column(String(50), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="pending", index=True) # pending, running, completed, failed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    items_found = Column(Integer, default=0)
    items_inserted = Column(Integer, default=0)
    errors_count = Column(Integer, default=0)
    triggered_by = Column(String(50), default="celery_beat") # manual, celery_beat

    errors = relationship("CrawlError", back_populates="crawl_run", cascade="all, delete-orphan")

class CrawlError(Base):
    __tablename__ = "crawl_errors"

    id = Column(Integer, primary_key=True, index=True)
    crawl_run_id = Column(Integer, ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(500), nullable=True)
    error_type = Column(String(100), nullable=False)
    error_message = Column(Text, nullable=False)
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    crawl_run = relationship("CrawlRun", back_populates="errors")
