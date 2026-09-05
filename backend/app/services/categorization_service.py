import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.repositories.company_repository import CompanyRepository
from app.repositories.news_repository import NewsRepository
from app.models.company import Company

class CategorizationService:
    def __init__(self, db: Session):
        self.db = db
        self.company_repo = CompanyRepository(db)
        self.news_repo = NewsRepository(db)

    def categorize_article(self, headline: str, body: str = "") -> List[Tuple[Company, float, str]]:
        """
        Categorizes news content into matching companies.
        Returns a list of tuples: (Company, confidence_score, method)
        """
        companies = self.company_repo.get_all(active_only=True)
        text = f"{headline} {body}"
        text_upper = text.upper()
        text_lower = text.lower()

        matches = []

        for company in companies:
            symbol = company.symbol.upper()
            name = company.name.strip()
            name_lower = name.lower()

            # Rule 1: Exact symbol match surrounded by word boundaries (highest confidence)
            symbol_pattern = r'\b' + re.escape(symbol) + r'\b'
            symbol_hits = len(re.findall(symbol_pattern, text_upper))

            # Rule 2: Exact company name match
            name_hits = 0
            if len(name) > 3 and name_lower in text_lower:
                name_hits = text_lower.count(name_lower)

            # Rule 3: Key alias/stem match (e.g. "Nabil Bank" -> "Nabil")
            stem = name.split()[0] if len(name.split()) > 0 else ""
            stem_hits = 0
            if len(stem) > 3 and stem.lower() != "company" and stem.lower() != "limited":
                stem_pattern = r'\b' + re.escape(stem) + r'\b'
                stem_hits = len(re.findall(stem_pattern, text, re.IGNORECASE))

            if symbol_hits > 0:
                confidence = min(0.95, 0.85 + (symbol_hits * 0.05))
                method = "exact_symbol"
                matches.append((company, round(confidence, 2), method))
            elif name_hits > 0:
                confidence = min(0.90, 0.75 + (name_hits * 0.05))
                method = "exact_name"
                matches.append((company, round(confidence, 2), method))
            elif stem_hits > 0:
                confidence = 0.60
                method = "alias_match"
                matches.append((company, round(confidence, 2), method))

        return matches
