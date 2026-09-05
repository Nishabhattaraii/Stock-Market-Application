from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from app.repositories.news_repository import NewsRepository
from app.services.categorization_service import CategorizationService
from app.utils.deduplication import canonicalize_url, generate_content_hash
from app.schemas.news import NewsArticleOut, NewsCorrectionCreate, NewsCorrectionOut
from app.core.exceptions import NotFoundException

class NewsService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = NewsRepository(db)
        self.categorizer = CategorizationService(db)

    def ingest_article(self, headline: str, published_at: datetime, source: str, raw_url: str, body: str = "", excerpt: str = "") -> Tuple[NewsArticleOut, bool]:
        canonical_url = canonicalize_url(raw_url)
        content_hash = generate_content_hash(headline, body)

        existing = self.repo.get_by_canonical_url(canonical_url)
        if existing:
            return NewsArticleOut.model_validate(existing), False # Already exists, skipped insert

        article = self.repo.create_article(
            headline=headline,
            published_at=published_at,
            source=source,
            canonical_url=canonical_url,
            body=body,
            excerpt=excerpt,
            content_hash=content_hash
        )

        # Categorize multi-label
        matches = self.categorizer.categorize_article(headline=headline, body=body)
        for company, confidence, method in matches:
            self.repo.add_tag(article_id=article.id, company_id=company.id, confidence=confidence, method=method)

        self.db.refresh(article)
        return NewsArticleOut.model_validate(article), True

    def get_news(self, company_id: Optional[int] = None, source: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[NewsArticleOut]:
        articles = self.repo.get_articles(company_id=company_id, source=source, limit=limit, offset=offset)
        return [NewsArticleOut.model_validate(a) for a in articles]

    def recategorize_article(self, article_id: int, correction_in: NewsCorrectionCreate, user_name: str) -> NewsCorrectionOut:
        article = self.repo.get_article_by_id(article_id)
        if not article:
            raise NotFoundException(f"Article ID {article_id} not found")

        old_confidence = None
        if correction_in.old_company_id:
            for tag in article.tags:
                if tag.company_id == correction_in.old_company_id:
                    old_confidence = tag.confidence
                    break

        correction = self.repo.record_correction(
            article_id=article_id,
            old_company_id=correction_in.old_company_id,
            new_company_id=correction_in.new_company_id,
            old_confidence=old_confidence,
            corrected_by=user_name,
            reason=correction_in.correction_reason or "Analyst correction"
        )
        return NewsCorrectionOut.model_validate(correction)

    def get_corrections(self, limit: int = 50) -> List[NewsCorrectionOut]:
        corrections = self.repo.get_corrections(limit=limit)
        return [NewsCorrectionOut.model_validate(c) for c in corrections]
