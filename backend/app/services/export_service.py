import csv
import io
from typing import Dict, Any, List
from sqlalchemy.orm import Session, joinedload
from app.models.news import NewsArticle
from app.models.news_tag import NewsCompanyTag
from app.models.correction import NewsCorrection
from app.models.analysis import AnalysisSnapshot

class ExportService:
    def __init__(self, db: Session):
        self.db = db

    def export_news_dataset(self, format_type: str = "json") -> Any:
        articles = self.db.query(NewsArticle).options(
            joinedload(NewsArticle.tags).joinedload(NewsCompanyTag.company),
            joinedload(NewsArticle.corrections)
        ).all()

        data = []
        for art in articles:
            predicted_labels = [t.company.symbol for t in art.tags if t.company]
            confidences = [t.confidence for t in art.tags]
            
            # Check if there is a manual correction
            corrected_labels = list(predicted_labels)
            if art.corrections:
                latest_corr = art.corrections[-1]
                # Find company symbol for new_company_id
                if latest_corr.new_company_id:
                    from app.models.company import Company
                    comp = self.db.query(Company).filter(Company.id == latest_corr.new_company_id).first()
                    if comp:
                        corrected_labels = [comp.symbol]

            data.append({
                "article_id": art.id,
                "headline": art.headline,
                "body": art.body or art.excerpt,
                "source": art.source,
                "published_at": art.published_at.isoformat(),
                "canonical_url": art.canonical_url,
                "predicted_labels": predicted_labels,
                "confidence_scores": confidences,
                "corrected_labels": corrected_labels
            })

        if format_type == "csv":
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=["article_id", "headline", "source", "published_at", "predicted_labels", "corrected_labels", "canonical_url"])
            writer.writeheader()
            for row in data:
                writer.writerow({
                    "article_id": row["article_id"],
                    "headline": row["headline"],
                    "source": row["source"],
                    "published_at": row["published_at"],
                    "predicted_labels": ",".join(row["predicted_labels"]),
                    "corrected_labels": ",".join(row["corrected_labels"]),
                    "canonical_url": row["canonical_url"]
                })
            return output.getvalue()

        if format_type == "pdf":
            from reportlab.lib.pagesizes import letter, landscape
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
            elements = []
            styles = getSampleStyleSheet()

            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontSize=16,
                textColor=colors.HexColor('#0f172a'),
                spaceAfter=6
            )
            sub_style = ParagraphStyle(
                'DocSubTitle',
                parent=styles['Normal'],
                fontSize=10,
                textColor=colors.HexColor('#64748b'),
                spaceAfter=15
            )
            cell_style = ParagraphStyle(
                'TableCell',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.HexColor('#1e293b')
            )
            cell_header_style = ParagraphStyle(
                'TableHeaderCell',
                parent=styles['Normal'],
                fontSize=9.5,
                fontName='Helvetica-Bold',
                textColor=colors.white
            )

            elements.append(Paragraph("Nepal Stock Market Intelligence - News Tag Correction Audit Log", title_style))
            elements.append(Paragraph(f"Dataset Export Report | Total Processed Articles: {len(data)}", sub_style))

            table_data = [[
                Paragraph("Article ID", cell_header_style),
                Paragraph("Headline", cell_header_style),
                Paragraph("Source", cell_header_style),
                Paragraph("Published At", cell_header_style),
                Paragraph("Predicted Tag(s)", cell_header_style),
                Paragraph("Corrected Tag(s)", cell_header_style),
            ]]

            for row in data:
                table_data.append([
                    Paragraph(f"#{row['article_id']}", cell_style),
                    Paragraph(row['headline'], cell_style),
                    Paragraph(row['source'], cell_style),
                    Paragraph(row['published_at'][:10], cell_style),
                    Paragraph(", ".join(row['predicted_labels']) if row['predicted_labels'] else "Uncategorized", cell_style),
                    Paragraph(", ".join(row['corrected_labels']) if row['corrected_labels'] else "Uncategorized", cell_style),
                ])

            t = Table(table_data, colWidths=[60, 260, 80, 80, 110, 110])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
            ]))

            elements.append(t)
            doc.build(elements)
            pdf_bytes = buffer.getvalue()
            buffer.close()
            return pdf_bytes

        return data

    def export_analysis_dataset(self, format_type: str = "json") -> Any:
        snapshots = self.db.query(AnalysisSnapshot).options(joinedload(AnalysisSnapshot.company)).all()
        data = []
        for s in snapshots:
            data.append({
                "company_symbol": s.company.symbol if s.company else None,
                "analysis_date": str(s.analysis_date),
                "vwap": s.vwap,
                "close_price": s.close_price,
                "buy_quantity": s.buy_quantity,
                "sell_quantity": s.sell_quantity,
                "pressure_score": s.pressure_score,
                "volume_average": s.volume_average,
                "volume_anomaly": s.volume_anomaly,
                "news_count": s.news_count,
                "next_day_return": s.next_day_return,
                "next_day_volume_change": s.next_day_volume_change
            })

        if format_type == "csv":
            output = io.StringIO()
            if data:
                writer = csv.DictWriter(output, fieldnames=list(data[0].keys()))
                writer.writeheader()
                writer.writerows(data)
            return output.getvalue()

        return data
