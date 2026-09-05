from datetime import date
from app.tasks.celery_app import celery_app
from app.database import SessionLocal
from app.repositories.company_repository import CompanyRepository
from app.services.analysis_service import AnalysisService

@celery_app.task(name="app.tasks.analysis_tasks.recalculate_all_snapshots_task")
def recalculate_all_snapshots_task():
    db = SessionLocal()
    try:
        company_repo = CompanyRepository(db)
        analysis_service = AnalysisService(db)
        companies = company_repo.get_all()
        today = date.today()

        count = 0
        for company in companies:
            analysis_service.compute_and_save_snapshot(company.id, today)
            count += 1
        return {"status": "success", "snapshots_processed": count}
    finally:
        db.close()
