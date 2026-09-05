from datetime import datetime, date
from typing import Optional

def parse_date(date_str: str) -> Optional[datetime]:
    formats = [
        "%Y-%m-%d",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ",
        "%d %b %Y",
        "%B %d, %Y",
        "%Y/%m/%d"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None

def format_date_utc(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")
