from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from app.models.crawl import CrawlRun, CrawlError

class CrawlRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_crawl_run(self, portal: str, triggered_by: str = "celery_beat") -> CrawlRun:
        crawl_run = CrawlRun(portal=portal, status="running", started_at=datetime.utcnow(), triggered_by=triggered_by)
        self.db.add(crawl_run)
        self.db.commit()
        self.db.refresh(crawl_run)
        return crawl_run

    def update_crawl_run(self, crawl_run_id: int, status: str, items_found: int = 0, items_inserted: int = 0, errors_count: int = 0) -> CrawlRun:
        crawl_run = self.db.query(CrawlRun).filter(CrawlRun.id == crawl_run_id).first()
        if crawl_run:
            crawl_run.status = status
            crawl_run.items_found = items_found
            crawl_run.items_inserted = items_inserted
            crawl_run.errors_count = errors_count
            if status in ["completed", "failed"]:
                crawl_run.completed_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(crawl_run)
        return crawl_run

    def add_crawl_error(self, crawl_run_id: int, error_type: str, error_message: str, url: str = None, retry_count: int = 0) -> CrawlError:
        err = CrawlError(
            crawl_run_id=crawl_run_id,
            url=url,
            error_type=error_type,
            error_message=error_message,
            retry_count=retry_count
        )
        self.db.add(err)
        self.db.commit()
        self.db.refresh(err)
        return err

    def get_crawl_runs(self, limit: int = 30) -> List[CrawlRun]:
        return self.db.query(CrawlRun).options(joinedload(CrawlRun.errors)).order_by(CrawlRun.started_at.desc()).limit(limit).all()

    def get_crawl_run(self, crawl_run_id: int) -> Optional[CrawlRun]:
        return self.db.query(CrawlRun).options(joinedload(CrawlRun.errors)).filter(CrawlRun.id == crawl_run_id).first()
