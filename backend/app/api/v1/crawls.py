from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.core.permissions import RoleChecker
from app.repositories.crawl_repository import CrawlRepository
from app.schemas.crawl import CrawlRunOut, CrawlTriggerRequest
from app.tasks.crawl_tasks import execute_crawl
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/crawls", tags=["Crawls"])

@router.get("", response_model=List[CrawlRunOut])
def list_crawls(limit: int = 30, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    repo = CrawlRepository(db)
    return repo.get_crawl_runs(limit=limit)

@router.post("/trigger", status_code=status.HTTP_202_ACCEPTED)
def trigger_crawl(trigger_req: CrawlTriggerRequest, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["Admin"]))):
    portals = ["merolagani", "sharesansar", "nepsealpha", "bizmandu", "market_data"] if trigger_req.portal == "all" else [trigger_req.portal]
    results = []
    for portal in portals:
        res = execute_crawl(portal, triggered_by=f"manual_{current_user.name}")
        results.append(res)
    return {"message": "Crawl job(s) executed", "results": results}

@router.get("/{crawl_id}", response_model=CrawlRunOut)
def get_crawl(crawl_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    repo = CrawlRepository(db)
    crawl_run = repo.get_crawl_run(crawl_id)
    if not crawl_run:
        raise NotFoundException(f"Crawl run ID {crawl_id} not found")
    return crawl_run
