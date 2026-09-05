from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.services.market_data_service import MarketDataService
from app.schemas.price import DailyPriceOut, FloorsheetOut

router = APIRouter(prefix="/prices", tags=["Prices"])

@router.get("", response_model=List[DailyPriceOut])
def get_prices(company_id: int, limit: int = 30, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    service = MarketDataService(db)
    return service.get_prices(company_id=company_id, limit=limit)
