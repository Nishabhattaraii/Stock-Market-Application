import asyncio
from datetime import datetime, date
from typing import Dict, Any
from app.tasks.celery_app import celery_app
from app.database import SessionLocal
from app.crawlers.registry import get_crawler
from app.repositories.crawl_repository import CrawlRepository
from app.repositories.company_repository import CompanyRepository
from app.services.news_service import NewsService
from app.services.market_data_service import MarketDataService
from app.services.analysis_service import AnalysisService
from app.websocket.manager import manager
import logging

logger = logging.getLogger(__name__)

def execute_crawl(portal: str, triggered_by: str = "celery_beat") -> Dict[str, Any]:
    db = SessionLocal()
    crawl_repo = CrawlRepository(db)
    crawl_run = crawl_repo.create_crawl_run(portal=portal, triggered_by=triggered_by)

    try:
        # Broadcast crawl start via websocket if async loop is running
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(manager.broadcast({
                    "event": "crawl_start",
                    "portal": portal,
                    "crawl_id": crawl_run.id
                }))
        except Exception:
            pass

        crawler = get_crawler(portal)
        raw_items = crawler.crawl()

        items_found = len(raw_items) if isinstance(raw_items, list) else 0
        items_inserted = 0
        errors_count = 0

        if portal in ["market_data", "nepsealpha_metrics"] and isinstance(raw_items, dict):
            market_service = MarketDataService(db)
            analysis_service = AnalysisService(db)
            company_repo = CompanyRepository(db)

            # 1. Update Company metrics
            for item in raw_items.get("company_metrics", []):
                try:
                    sym = item.get("symbol")
                    if sym:
                        company_repo.update_metrics(sym, item)
                        items_inserted += 1
                except Exception as e:
                    errors_count += 1
                    crawl_repo.add_crawl_error(crawl_run.id, "CompanyMetricsUpdateError", str(e))

            # 2. Insert daily prices
            for item in raw_items.get("daily_prices", []):
                try:
                    market_service.record_daily_price(
                        symbol=item["symbol"],
                        trading_date=item["trading_date"],
                        open_p=item["open"],
                        high_p=item["high"],
                        low_p=item["low"],
                        close_p=item["close"],
                        volume=item["volume"],
                        turnover=item.get("turnover"),
                        source=item.get("source", "nepse")
                    )
                    items_inserted += 1
                except Exception as e:
                    errors_count += 1
                    crawl_repo.add_crawl_error(crawl_run.id, "DailyPriceInsertError", str(e))

            # 3. Insert floorsheets
            for item in raw_items.get("floorsheets", []):
                try:
                    market_service.record_floorsheet(
                        symbol=item["symbol"],
                        trading_date=item["trading_date"],
                        buyer_broker=item["buyer_broker"],
                        seller_broker=item["seller_broker"],
                        quantity=item["quantity"],
                        rate=item["rate"],
                        tx_time=item.get("transaction_time"),
                        source=item.get("source", "nepse_floorsheet")
                    )
                    items_inserted += 1
                except Exception as e:
                    errors_count += 1
                    crawl_repo.add_crawl_error(crawl_run.id, "FloorsheetInsertError", str(e))

            # 4. Re-calculate analysis snapshots for affected companies
            companies = company_repo.get_all()
            today = date.today()
            for comp in companies:
                try:
                    analysis_service.compute_and_save_snapshot(comp.id, today)
                except Exception as e:
                    logger.warning(f"Error computing snapshot for company {comp.symbol}: {e}")


        else: # News portals
            news_service = NewsService(db)
            for item in raw_items:
                try:
                    art, inserted = news_service.ingest_article(
                        headline=item["headline"],
                        published_at=item.get("published_at", datetime.utcnow()),
                        source=item.get("source", portal),
                        raw_url=item["canonical_url"],
                        body=item.get("body", ""),
                        excerpt=item.get("excerpt", "")
                    )
                    if inserted:
                        items_inserted += 1
                except Exception as e:
                    errors_count += 1
                    crawl_repo.add_crawl_error(crawl_run.id, "NewsIngestError", str(e), url=item.get("canonical_url"))

        status = "completed" if errors_count == 0 else "completed_with_errors"
        crawl_run = crawl_repo.update_crawl_run(
            crawl_run_id=crawl_run.id,
            status=status,
            items_found=items_found,
            items_inserted=items_inserted,
            errors_count=errors_count
        )

        return {
            "crawl_id": crawl_run.id,
            "status": status,
            "items_found": items_found,
            "items_inserted": items_inserted,
            "errors_count": errors_count
        }

    except Exception as e:
        logger.error(f"Crawl failed for portal {portal}: {e}")
        crawl_repo.add_crawl_error(crawl_run.id, "FatalCrawlError", str(e))
        crawl_repo.update_crawl_run(crawl_run.id, status="failed", errors_count=1)
        return {"crawl_id": crawl_run.id, "status": "failed", "error": str(e)}
    finally:
        db.close()

@celery_app.task(name="app.tasks.crawl_tasks.run_portal_crawl_task")
def run_portal_crawl_task(portal: str, triggered_by: str = "celery_beat"):
    return execute_crawl(portal, triggered_by)
