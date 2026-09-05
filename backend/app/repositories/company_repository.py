from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.company import Company

class CompanyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, active_only: bool = True) -> List[Company]:
        query = self.db.query(Company)
        if active_only:
            query = query.filter(Company.is_active == True)
        return query.order_by(Company.symbol.asc()).all()

    def get_by_id(self, company_id: int) -> Optional[Company]:
        return self.db.query(Company).filter(Company.id == company_id).first()

    def get_by_symbol(self, symbol: str) -> Optional[Company]:
        return self.db.query(Company).filter(Company.symbol == symbol.upper()).first()

    def update_metrics(self, symbol: str, metrics: dict) -> Optional[Company]:
        company = self.get_by_symbol(symbol)
        if company:
            for key, val in metrics.items():
                if hasattr(company, key) and val is not None:
                    setattr(company, key, val)
            self.db.commit()
            self.db.refresh(company)
        return company

    def create(self, symbol: str, name: str, sector: str) -> Company:
        company = Company(symbol=symbol.upper(), name=name, sector=sector)
        self.db.add(company)
        self.db.commit()
        self.db.refresh(company)
        return company

