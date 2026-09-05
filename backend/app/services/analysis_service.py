from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.repositories.company_repository import CompanyRepository
from app.repositories.market_repository import MarketRepository
from app.repositories.news_repository import NewsRepository
from app.models.daily_price import DailyPrice
from app.models.floorsheet import FloorsheetTransaction
from app.models.news import NewsArticle
from app.models.news_tag import NewsCompanyTag
from app.models.analysis import AnalysisSnapshot
from app.schemas.company import CompanyOut
from app.schemas.analysis import (
    AnalysisSnapshotOut, BrokerBreakdownOut, BrokerBreakdownItem,
    CompanyComparisonItem, ComparisonOut, CompanyAnalysisDetail
)
from app.core.exceptions import NotFoundException

class AnalysisService:
    def __init__(self, db: Session):
        self.db = db
        self.company_repo = CompanyRepository(db)
        self.market_repo = MarketRepository(db)
        self.news_repo = NewsRepository(db)

    def compute_and_save_snapshot(self, company_id: int, target_date: date) -> AnalysisSnapshotOut:
        company = self.company_repo.get_by_id(company_id)
        if not company:
            raise NotFoundException(f"Company ID {company_id} not found")

        # 1. Prices & Volume Anomaly
        prices = self.db.query(DailyPrice).filter(
            DailyPrice.company_id == company_id,
            DailyPrice.trading_date <= target_date
        ).order_by(DailyPrice.trading_date.desc()).limit(30).all()

        current_price = prices[0] if prices else None
        close_p = current_price.close if current_price else None
        curr_vol = current_price.volume if current_price else 0.0

        # Calculate rolling average volume excluding target date
        prev_prices = prices[1:] if len(prices) > 1 else []
        if prev_prices:
            avg_vol = sum(p.volume for p in prev_prices) / len(prev_prices)
        else:
            avg_vol = curr_vol if curr_vol > 0 else 1.0

        volume_anomaly = bool(curr_vol >= (2.0 * avg_vol) and curr_vol > 0)

        # 2. VWAP and Buy/Sell Pressure from Floorsheet & Market Data
        floorsheet = self.market_repo.get_floorsheet(company_id=company_id, trading_date=target_date)
        
        buy_qty = 0.0
        sell_qty = 0.0
        vwap = None

        if floorsheet:
            total_val = sum(tx.rate * tx.quantity for tx in floorsheet)
            total_qty = sum(tx.quantity for tx in floorsheet)
            if total_qty > 0:
                vwap = round(total_val / total_qty, 2)

            high_p = current_price.high if current_price else (vwap or 1.0)
            low_p = current_price.low if current_price else (vwap or 1.0)
            mid_p = (high_p + low_p) / 2.0 if high_p != low_p else (vwap or 1.0)

            for tx in floorsheet:
                if tx.rate >= mid_p:
                    buy_qty += tx.quantity * 0.7
                    sell_qty += tx.quantity * 0.3
                else:
                    buy_qty += tx.quantity * 0.3
                    sell_qty += tx.quantity * 0.7
        elif current_price:
            # Typical price approximation
            vwap = round((current_price.high + current_price.low + current_price.close) / 3.0, 2)
            rng = max(0.01, current_price.high - current_price.low)
            buy_ratio = max(0.15, min(0.85, (current_price.close - current_price.low) / rng))
            buy_qty = round(current_price.volume * buy_ratio, 2)
            sell_qty = round(current_price.volume * (1.0 - buy_ratio), 2)

        buy_qty = round(buy_qty, 2)
        sell_qty = round(sell_qty, 2)
        denom = buy_qty + sell_qty
        pressure_score = round((buy_qty - sell_qty) / denom, 4) if denom > 0 else 0.0

        # 3. News Count on target date
        news_count = self.db.query(func.count(NewsCompanyTag.id)).join(
            NewsArticle, NewsArticle.id == NewsCompanyTag.article_id
        ).filter(
            NewsCompanyTag.company_id == company_id,
            func.date(NewsArticle.published_at) == target_date
        ).scalar() or 0

        # 4. Next day return & volume change calculation
        next_price = self.db.query(DailyPrice).filter(
            DailyPrice.company_id == company_id,
            DailyPrice.trading_date > target_date
        ).order_by(DailyPrice.trading_date.asc()).first()

        next_day_ret = None
        next_day_vol_chg = None
        if current_price and next_price and current_price.close > 0:
            next_day_ret = round(((next_price.close - current_price.close) / current_price.close) * 100.0, 2)
            if current_price.volume > 0:
                next_day_vol_chg = round(((next_price.volume - current_price.volume) / current_price.volume) * 100.0, 2)

        # Upsert snapshot
        snapshot = self.db.query(AnalysisSnapshot).filter(
            AnalysisSnapshot.company_id == company_id,
            AnalysisSnapshot.analysis_date == target_date
        ).first()

        if snapshot:
            snapshot.vwap = vwap
            snapshot.close_price = close_p
            snapshot.buy_quantity = buy_qty
            snapshot.sell_quantity = sell_qty
            snapshot.pressure_score = pressure_score
            snapshot.volume_average = avg_vol
            snapshot.volume_anomaly = volume_anomaly
            snapshot.news_count = news_count
            snapshot.next_day_return = next_day_ret
            snapshot.next_day_volume_change = next_day_vol_chg
        else:
            snapshot = AnalysisSnapshot(
                company_id=company_id,
                analysis_date=target_date,
                vwap=vwap,
                close_price=close_p,
                buy_quantity=buy_qty,
                sell_quantity=sell_qty,
                pressure_score=pressure_score,
                volume_average=avg_vol,
                volume_anomaly=volume_anomaly,
                news_count=news_count,
                next_day_return=next_day_ret,
                next_day_volume_change=next_day_vol_chg
            )
            self.db.add(snapshot)

        self.db.commit()
        self.db.refresh(snapshot)
        return AnalysisSnapshotOut.model_validate(snapshot)

    def get_broker_breakdown(self, company_id: int, trading_date: Optional[date] = None) -> BrokerBreakdownOut:
        if not trading_date:
            latest = self.db.query(DailyPrice).filter(DailyPrice.company_id == company_id).order_by(DailyPrice.trading_date.desc()).first()
            trading_date = latest.trading_date if latest else date.today()

        floorsheets = self.market_repo.get_floorsheet(company_id=company_id, trading_date=trading_date)
        
        buyers: Dict[int, Dict[str, Any]] = {}
        sellers: Dict[int, Dict[str, Any]] = {}
        total_qty = 0.0

        for tx in floorsheets:
            total_qty += tx.quantity
            b_id = tx.buyer_broker
            if b_id not in buyers:
                buyers[b_id] = {"buy": 0.0, "count": 0}
            buyers[b_id]["buy"] += tx.quantity
            buyers[b_id]["count"] += 1

            s_id = tx.seller_broker
            if s_id not in sellers:
                sellers[s_id] = {"sell": 0.0, "count": 0}
            sellers[s_id]["sell"] += tx.quantity
            sellers[s_id]["count"] += 1

        top_buyers = []
        for b_id, data in sorted(buyers.items(), key=lambda x: x[1]["buy"], reverse=True)[:5]:
            pct = round((data["buy"] / total_qty) * 100.0, 2) if total_qty > 0 else 0.0
            top_buyers.append(BrokerBreakdownItem(
                broker_id=b_id,
                buy_quantity=data["buy"],
                sell_quantity=0.0,
                net_quantity=data["buy"],
                transaction_count=data["count"],
                percentage_contribution=pct
            ))

        top_sellers = []
        for s_id, data in sorted(sellers.items(), key=lambda x: x[1]["sell"], reverse=True)[:5]:
            pct = round((data["sell"] / total_qty) * 100.0, 2) if total_qty > 0 else 0.0
            top_sellers.append(BrokerBreakdownItem(
                broker_id=s_id,
                buy_quantity=0.0,
                sell_quantity=data["sell"],
                net_quantity=-data["sell"],
                transaction_count=data["count"],
                percentage_contribution=pct
            ))

        return BrokerBreakdownOut(
            company_id=company_id,
            trading_date=trading_date,
            top_buyers=top_buyers,
            top_sellers=top_sellers
        )

    def get_company_comparison(self, company_ids: List[int]) -> ComparisonOut:
        items = []
        for c_id in company_ids:
            company = self.company_repo.get_by_id(c_id)
            if not company:
                continue

            prices = self.db.query(DailyPrice).filter(DailyPrice.company_id == c_id).order_by(DailyPrice.trading_date.desc()).limit(15).all()
            latest = prices[0] if prices else None
            prev = prices[1] if len(prices) > 1 else None

            close_ret = None
            if latest and prev and prev.close > 0:
                close_ret = round(((latest.close - prev.close) / prev.close) * 100.0, 2)

            avg_vol = sum(p.volume for p in prices) / len(prices) if prices else 0.0
            anomaly = bool(latest and latest.volume >= (2.0 * avg_vol) and latest.volume > 0)

            news_count = self.db.query(func.count(NewsCompanyTag.id)).filter(NewsCompanyTag.company_id == c_id).scalar() or 0

            items.append(CompanyComparisonItem(
                company=CompanyOut.model_validate(company),
                latest_close=latest.close if latest else None,
                close_return_pct=close_ret,
                avg_volume=avg_vol,
                volume_anomaly=anomaly,
                news_count_30d=news_count,
                pressure_score=0.15 if anomaly else 0.02
            ))

        return ComparisonOut(companies=items)

    def get_company_detail_analysis(self, company_id: int) -> CompanyAnalysisDetail:
        company = self.company_repo.get_by_id(company_id)
        if not company:
            raise NotFoundException(f"Company ID {company_id} not found")

        prices = self.db.query(DailyPrice).filter(
            DailyPrice.company_id == company_id
        ).order_by(DailyPrice.trading_date.desc()).limit(30).all()

        if not prices:
            raise NotFoundException(f"No price records found for company ID {company_id}")

        latest_price = prices[0]
        latest_snap_out = self.compute_and_save_snapshot(company_id, latest_price.trading_date)
        latest_snap = self.db.query(AnalysisSnapshot).filter(AnalysisSnapshot.id == latest_snap_out.id).first()

        snapshots = self.db.query(AnalysisSnapshot).filter(
            AnalysisSnapshot.company_id == company_id
        ).order_by(AnalysisSnapshot.analysis_date.desc()).limit(30).all()

        broker_bd = self.get_broker_breakdown(company_id=company_id)
        
        # Build 30-day VWAP vs Close price time series
        vwap_chart = []
        for p in reversed(prices):
            floorsheets = self.db.query(FloorsheetTransaction).filter(
                FloorsheetTransaction.company_id == company_id,
                FloorsheetTransaction.trading_date == p.trading_date
            ).all()

            if floorsheets:
                tot_val = sum(tx.rate * tx.quantity for tx in floorsheets)
                tot_qty = sum(tx.quantity for tx in floorsheets)
                vwap_val = round(tot_val / tot_qty, 2) if tot_qty > 0 else p.close
            else:
                vwap_val = round((p.high + p.low + p.close) / 3.0, 2)

            vwap_chart.append({
                "date": str(p.trading_date),
                "vwap": vwap_val,
                "close": p.close
            })

        return CompanyAnalysisDetail(
            company=CompanyOut.model_validate(company),
            latest_snapshot=AnalysisSnapshotOut.model_validate(latest_snap) if latest_snap else None,
            snapshots=[AnalysisSnapshotOut.model_validate(s) for s in snapshots],
            broker_breakdown=broker_bd,
            vwap_comparison=vwap_chart
        )

