from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.core.permissions import RoleChecker
from app.services.news_service import NewsService
from app.schemas.news import NewsArticleOut, NewsCorrectionCreate, NewsCorrectionOut

router = APIRouter(prefix="/news", tags=["News"])

@router.get("", response_model=List[NewsArticleOut])
def list_news(
    company_id: Optional[int] = None,
    source: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    service = NewsService(db)
    return service.get_news(company_id=company_id, source=source, limit=limit, offset=offset)

@router.post("/{article_id}/recategorize", response_model=NewsCorrectionOut)
def recategorize_article(
    article_id: int,
    correction_in: NewsCorrectionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Analyst"]))
):
    service = NewsService(db)
    return service.recategorize_article(article_id=article_id, correction_in=correction_in, user_name=current_user.name)

@router.get("/corrections", response_model=List[NewsCorrectionOut])
def get_corrections(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Analyst"]))
):
    service = NewsService(db)
    return service.get_corrections(limit=limit)
