import time
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
from app.config import settings

logger = logging.getLogger(__name__)

class BaseCrawler(ABC):
    portal_name: str = "base"
    base_url: str = ""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, impervious crawler)"
        })

    def fetch_page(self, url: str) -> Optional[str]:
        retries = settings.CRAWLER_MAX_RETRIES
        delay = settings.CRAWLER_DELAY_SECONDS

        for attempt in range(retries):
            try:
                time.sleep(delay)
                response = self.session.get(url, timeout=settings.CRAWLER_TIMEOUT_SECONDS)
                if response.status_code == 200:
                    return response.text
                logger.warning(f"[{self.portal_name}] HTTP {response.status_code} fetching {url}")
            except Exception as e:
                logger.warning(f"[{self.portal_name}] Attempt {attempt+1}/{retries} failed for {url}: {e}")
                delay *= 2 # Exponential backoff
        return None

    @abstractmethod
    def crawl(self) -> List[Dict[str, Any]]:
        pass
