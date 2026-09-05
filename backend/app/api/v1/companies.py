from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.core.permissions import RoleChecker
from app.services.company_service import CompanyService
from app.services.market_data_service import MarketDataService
from app.services.news_service import NewsService
from app.services.analysis_service import AnalysisService
from app.schemas.company import CompanyOut, CompanyCreate
from app.schemas.price import DailyPriceOut
from app.schemas.news import NewsArticleOut
from app.schemas.analysis import CompanyAnalysisDetail

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyOut])
def list_companies(active_only: bool = True, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    service = CompanyService(db)
    return service.get_companies(active_only=active_only)

@router.post("", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
def create_company(company_in: CompanyCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["Admin"]))):
    service = CompanyService(db)
    return service.create_company(company_in)

@router.get("/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    service = CompanyService(db)
    return service.get_company_by_id(company_id)

@router.get("/{company_id}/prices", response_model=List[DailyPriceOut])
def get_company_prices(company_id: int, limit: int = Query(30, ge=1, le=365), db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    service = MarketDataService(db)
    return service.get_prices(company_id=company_id, limit=limit)

@router.get("/{company_id}/news", response_model=List[NewsArticleOut])
def get_company_news(company_id: int, limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    service = NewsService(db)
    return service.get_news(company_id=company_id, limit=limit)

@router.get("/{company_id}/analysis", response_model=CompanyAnalysisDetail)
def get_company_analysis(company_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    service = AnalysisService(db)
    return service.get_company_detail_analysis(company_id=company_id)
