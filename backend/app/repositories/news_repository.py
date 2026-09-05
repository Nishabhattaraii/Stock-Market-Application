from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from app.models.news import NewsArticle
from app.models.news_tag import NewsCompanyTag
from app.models.correction import NewsCorrection

class NewsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_canonical_url(self, canonical_url: str) -> Optional[NewsArticle]:
        return self.db.query(NewsArticle).filter(NewsArticle.canonical_url == canonical_url).first()

    def create_article(self, headline: str, published_at: datetime, source: str, canonical_url: str, body: str = "", excerpt: str = "", content_hash: str = "") -> NewsArticle:
        article = NewsArticle(
            headline=headline,
            body=body,
            excerpt=excerpt or headline[:200],
            published_at=published_at,
            source=source,
            canonical_url=canonical_url,
            content_hash=content_hash
        )
        self.db.add(article)
        self.db.commit()
        self.db.refresh(article)
        return article

    def add_tag(self, article_id: int, company_id: int, confidence: float, method: str) -> NewsCompanyTag:
        existing = self.db.query(NewsCompanyTag).filter(
            NewsCompanyTag.article_id == article_id,
            NewsCompanyTag.company_id == company_id
        ).first()
        if existing:
            existing.confidence = confidence
            existing.method = method
            self.db.commit()
            self.db.refresh(existing)
            return existing

        tag = NewsCompanyTag(
            article_id=article_id,
            company_id=company_id,
            confidence=confidence,
            method=method
        )
        self.db.add(tag)
        self.db.commit()
        self.db.refresh(tag)
        return tag

    def get_articles(self, company_id: Optional[int] = None, source: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[NewsArticle]:
        query = self.db.query(NewsArticle).options(joinedload(NewsArticle.tags).joinedload(NewsCompanyTag.company))
        if source:
            query = query.filter(NewsArticle.source == source)
        if company_id:
            query = query.join(NewsCompanyTag).filter(NewsCompanyTag.company_id == company_id)
        return query.order_by(NewsArticle.published_at.desc()).offset(offset).limit(limit).all()

    def get_article_by_id(self, article_id: int) -> Optional[NewsArticle]:
        return self.db.query(NewsArticle).options(joinedload(NewsArticle.tags).joinedload(NewsCompanyTag.company)).filter(NewsArticle.id == article_id).first()

    def record_correction(self, article_id: int, old_company_id: Optional[int], new_company_id: int, old_confidence: Optional[float], corrected_by: str, reason: str) -> NewsCorrection:
        correction = NewsCorrection(
            article_id=article_id,
            old_company_id=old_company_id,
            new_company_id=new_company_id,
            old_confidence=old_confidence,
            corrected_by=corrected_by,
            correction_reason=reason
        )
        self.db.add(correction)
        
        if old_company_id:
            self.db.query(NewsCompanyTag).filter(
                NewsCompanyTag.article_id == article_id,
                NewsCompanyTag.company_id == old_company_id
            ).delete()

        self.add_tag(article_id, new_company_id, confidence=1.0, method="manual_correction")
        
        self.db.commit()
        self.db.refresh(correction)
        return correction

    def get_corrections(self, limit: int = 50) -> List[NewsCorrection]:
        return self.db.query(NewsCorrection).options(joinedload(NewsCorrection.article)).order_by(NewsCorrection.created_at.desc()).limit(limit).all()
