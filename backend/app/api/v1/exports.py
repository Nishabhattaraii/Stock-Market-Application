from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.core.permissions import RoleChecker
from app.services.export_service import ExportService

router = APIRouter(prefix="/exports", tags=["Exports"])

from fastapi.responses import Response, PlainTextResponse

@router.get("/news")
def export_news_dataset(
    format: str = Query("pdf", pattern="^(pdf|csv|json)$"),
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Analyst"]))
):
    service = ExportService(db)
    result = service.export_news_dataset(format_type=format)
    if format == "csv":
        return PlainTextResponse(content=result, media_type="text/csv")
    elif format == "pdf":
        return Response(content=result, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=news_retraining_dataset.pdf"})
    return result

@router.get("/analysis")
def export_analysis_dataset(
    format: str = Query("json", regex="^(json|csv)$"),
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Analyst"]))
):
    service = ExportService(db)
    result = service.export_analysis_dataset(format_type=format)
    if format == "csv":
        return PlainTextResponse(content=result, media_type="text/csv")
    return result
