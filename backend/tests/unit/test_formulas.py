from datetime import date
from app.models.company import Company
from app.models.daily_price import DailyPrice
from app.models.floorsheet import FloorsheetTransaction
from app.services.analysis_service import AnalysisService

def test_financial_formulas(db_session):
    comp = Company(symbol="NTC", name="Nepal Telecom", sector="Telecom")
    db_session.add(comp)
    db_session.commit()

    today = date.today()

    # Historical price data (normal volume = 10000)
    for i in range(5, 0, -1):
        dp = DailyPrice(
            company_id=comp.id,
            trading_date=today - date.resolution * i,
            open=800, high=820, low=790, close=810,
            volume=10000.0, turnover=8100000.0
        )
        db_session.add(dp)

    # Spike volume on target date (volume = 30000 >= 2x avg)
    curr_dp = DailyPrice(
        company_id=comp.id,
        trading_date=today,
        open=810, high=850, low=800, close=840,
        volume=30000.0, turnover=25200000.0
    )
    db_session.add(curr_dp)

    # Floorsheet transactions for VWAP
    fs1 = FloorsheetTransaction(company_id=comp.id, trading_date=today, buyer_broker=45, seller_broker=19, quantity=100, rate=820.0)
    fs2 = FloorsheetTransaction(company_id=comp.id, trading_date=today, buyer_broker=45, seller_broker=32, quantity=300, rate=840.0)
    db_session.add_all([fs1, fs2])
    db_session.commit()

    service = AnalysisService(db_session)
    snapshot = service.compute_and_save_snapshot(comp.id, today)

    # Formula Verification:
    # VWAP = (100*820 + 300*840) / 400 = (82000 + 252000) / 400 = 334000 / 400 = 835.0
    assert snapshot.vwap == 835.0
    assert snapshot.volume_anomaly is True
    assert snapshot.pressure_score == 0.2 # Higher buy volume at 840 vs 820

