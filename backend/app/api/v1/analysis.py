from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.services.analysis_service import AnalysisService
from app.schemas.analysis import ComparisonOut

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.get("/comparison", response_model=ComparisonOut)
def compare_companies(
    company_ids: List[int] = Query(..., description="List of company IDs to compare"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    service = AnalysisService(db)
    return service.get_company_comparison(company_ids=company_ids)
