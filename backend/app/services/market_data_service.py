from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.repositories.market_repository import MarketRepository
from app.repositories.company_repository import CompanyRepository
from app.schemas.price import DailyPriceOut, FloorsheetOut
from app.core.exceptions import NotFoundException

class MarketDataService:
    def __init__(self, db: Session):
        self.db = db
        self.market_repo = MarketRepository(db)
        self.company_repo = CompanyRepository(db)

    def record_daily_price(self, symbol: str, trading_date: date, open_p: float, high_p: float, low_p: float, close_p: float, volume: float, turnover: Optional[float] = None, source: str = "nepse") -> DailyPriceOut:
        company = self.company_repo.get_by_symbol(symbol)
        if not company:
            # Auto register company if missing
            company = self.company_repo.create(symbol=symbol, name=symbol, sector="Commercial Bank")
        
        price = self.market_repo.upsert_daily_price(
            company_id=company.id,
            trading_date=trading_date,
            open_p=open_p,
            high_p=high_p,
            low_p=low_p,
            close_p=close_p,
            volume=volume,
            turnover=turnover,
            source=source
        )
        return DailyPriceOut.model_validate(price)

    def get_prices(self, company_id: int, limit: int = 30) -> List[DailyPriceOut]:
        company = self.company_repo.get_by_id(company_id)
        if not company:
            raise NotFoundException(f"Company ID {company_id} not found")
        prices = self.market_repo.get_prices(company_id=company_id, limit=limit)
        return [DailyPriceOut.model_validate(p) for p in prices]

    def record_floorsheet(self, symbol: str, trading_date: date, buyer_broker: int, seller_broker: int, quantity: float, rate: float, tx_time: str = None, source: str = "nepse_floorsheet") -> FloorsheetOut:
        company = self.company_repo.get_by_symbol(symbol)
        if not company:
            company = self.company_repo.create(symbol=symbol, name=symbol, sector="Commercial Bank")

        tx = self.market_repo.add_floorsheet_transaction(
            company_id=company.id,
            trading_date=trading_date,
            buyer_broker=buyer_broker,
            seller_broker=seller_broker,
            quantity=quantity,
            rate=rate,
            transaction_time=tx_time,
            source=source
        )
        return FloorsheetOut.model_validate(tx)
