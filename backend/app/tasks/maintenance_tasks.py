from datetime import datetime, timedelta
from app.tasks.celery_app import celery_app
from app.database import SessionLocal
from app.models.crawl import CrawlRun

@celery_app.task(name="app.tasks.maintenance_tasks.cleanup_old_crawl_logs_task")
def cleanup_old_crawl_logs_task(days: int = 30):
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        deleted = db.query(CrawlRun).filter(CrawlRun.started_at < cutoff).delete()
        db.commit()
        return {"status": "success", "deleted_logs": deleted}
    finally:
        db.close()
