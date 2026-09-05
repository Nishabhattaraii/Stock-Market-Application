from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyCreate, CompanyOut
from app.core.exceptions import BadRequestException, NotFoundException

class CompanyService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CompanyRepository(db)

    def get_companies(self, active_only: bool = True) -> List[CompanyOut]:
        companies = self.repo.get_all(active_only=active_only)
        return [CompanyOut.model_validate(c) for c in companies]

    def get_company_by_id(self, company_id: int) -> CompanyOut:
        company = self.repo.get_by_id(company_id)
        if not company:
            raise NotFoundException(f"Company ID {company_id} not found")
        return CompanyOut.model_validate(company)

    def create_company(self, company_in: CompanyCreate) -> CompanyOut:
        existing = self.repo.get_by_symbol(company_in.symbol)
        if existing:
            raise BadRequestException(f"Company symbol '{company_in.symbol}' already exists")
        company = self.repo.create(symbol=company_in.symbol, name=company_in.name, sector=company_in.sector)
        return CompanyOut.model_validate(company)
