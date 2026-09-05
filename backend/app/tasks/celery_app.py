from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "nepse_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.crawl_tasks", "app.tasks.analysis_tasks", "app.tasks.maintenance_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)

# Celery Beat schedule for periodic crawls
celery_app.conf.beat_schedule = {
    "periodic-crawl-merolagani": {
        "task": "app.tasks.crawl_tasks.run_portal_crawl_task",
        "schedule": crontab(minute="*/15"),
        "args": ("merolagani", "celery_beat")
    },
    "periodic-crawl-sharesansar": {
        "task": "app.tasks.crawl_tasks.run_portal_crawl_task",
        "schedule": crontab(minute="*/20"),
        "args": ("sharesansar", "celery_beat")
    },
    "periodic-market-data-crawl": {
        "task": "app.tasks.crawl_tasks.run_portal_crawl_task",
        "schedule": crontab(minute="0", hour="10,12,15"), # Trading hours schedule
        "args": ("market_data", "celery_beat")
    },
}
