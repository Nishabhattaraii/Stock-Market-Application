from app.services.categorization_service import CategorizationService
from app.models.company import Company

def test_categorization_logic(db_session):
    comp = Company(symbol="NABIL", name="Nabil Bank Limited", sector="Commercial Bank")
    db_session.add(comp)
    db_session.commit()

    service = CategorizationService(db_session)

    # 1. Exact symbol match test
    matches = service.categorize_article("Quarterly growth posted by NABIL bank on NEPSE.")
    assert len(matches) == 1
    assert matches[0][0].symbol == "NABIL"
    assert matches[0][1] >= 0.85
    assert matches[0][2] == "exact_symbol"

    # 2. Company name match test
    matches_name = service.categorize_article("Nabil Bank Limited announced dividend distribution.")
    assert len(matches_name) == 1
    assert matches_name[0][0].symbol == "NABIL"
