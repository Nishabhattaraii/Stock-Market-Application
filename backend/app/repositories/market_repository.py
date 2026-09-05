from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.models.daily_price import DailyPrice
from app.models.floorsheet import FloorsheetTransaction

class MarketRepository:
    def __init__(self, db: Session):
        self.db = db

    def upsert_daily_price(self, company_id: int, trading_date: date, open_p: float, high_p: float, low_p: float, close_p: float, volume: float, turnover: Optional[float] = None, source: str = "nepse") -> DailyPrice:
        price = self.db.query(DailyPrice).filter(
            DailyPrice.company_id == company_id,
            DailyPrice.trading_date == trading_date
        ).first()

        if price:
            price.open = open_p
            price.high = high_p
            price.low = low_p
            price.close = close_p
            price.volume = volume
            price.turnover = turnover
            price.source = source
        else:
            price = DailyPrice(
                company_id=company_id,
                trading_date=trading_date,
                open=open_p,
                high=high_p,
                low=low_p,
                close=close_p,
                volume=volume,
                turnover=turnover,
                source=source
            )
            self.db.add(price)

        self.db.commit()
        self.db.refresh(price)
        return price

    def get_prices(self, company_id: int, limit: int = 30) -> List[DailyPrice]:
        return self.db.query(DailyPrice).filter(
            DailyPrice.company_id == company_id
        ).order_by(DailyPrice.trading_date.desc()).limit(limit).all()

    def add_floorsheet_transaction(self, company_id: int, trading_date: date, buyer_broker: int, seller_broker: int, quantity: float, rate: float, transaction_time: str = None, source: str = "nepse_floorsheet") -> FloorsheetTransaction:
        tx = FloorsheetTransaction(
            company_id=company_id,
            trading_date=trading_date,
            buyer_broker=buyer_broker,
            seller_broker=seller_broker,
            quantity=quantity,
            rate=rate,
            transaction_time=transaction_time,
            source=source
        )
        self.db.add(tx)
        self.db.commit()
        self.db.refresh(tx)
        return tx

    def get_floorsheet(self, company_id: int, trading_date: Optional[date] = None) -> List[FloorsheetTransaction]:
        query = self.db.query(FloorsheetTransaction).filter(FloorsheetTransaction.company_id == company_id)
        if trading_date:
            query = query.filter(FloorsheetTransaction.trading_date == trading_date)
        return query.order_by(FloorsheetTransaction.id.asc()).all()
