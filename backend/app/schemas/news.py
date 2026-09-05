from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.company import CompanyOut

class NewsTagOut(BaseModel):
    id: int
    company_id: int
    company: Optional[CompanyOut] = None
    confidence: float
    method: str
    created_at: datetime

    class Config:
        from_attributes = True

class NewsArticleOut(BaseModel):
    id: int
    headline: str
    body: Optional[str] = None
    excerpt: Optional[str] = None
    published_at: datetime
    source: str
    canonical_url: str
    crawled_at: datetime
    tags: List[NewsTagOut] = []

    class Config:
        from_attributes = True

class NewsCorrectionCreate(BaseModel):
    new_company_id: int
    old_company_id: Optional[int] = None
    correction_reason: Optional[str] = None

class NewsCorrectionOut(BaseModel):
    id: int
    article_id: int
    old_company_id: Optional[int] = None
    new_company_id: int
    old_confidence: Optional[float] = None
    corrected_by: str
    correction_reason: Optional[str] = None
    created_at: datetime
    article: Optional[NewsArticleOut] = None

    class Config:
        from_attributes = True
