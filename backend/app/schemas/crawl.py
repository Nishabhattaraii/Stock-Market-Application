from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class CrawlErrorOut(BaseModel):
    id: int
    crawl_run_id: int
    url: Optional[str] = None
    error_type: str
    error_message: str
    retry_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class CrawlRunOut(BaseModel):
    id: int
    portal: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    items_found: int
    items_inserted: int
    errors_count: int
    triggered_by: str
    errors: List[CrawlErrorOut] = []

    class Config:
        from_attributes = True

class CrawlTriggerRequest(BaseModel):
    portal: str # merolagani, sharesansar, nepsealpha, bizmandu, all
