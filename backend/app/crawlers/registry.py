from typing import Dict, Type
from app.crawlers.base import BaseCrawler
from app.crawlers.merolagani import MeroLaganiCrawler
from app.crawlers.sharesansar import ShareSansarCrawler
from app.crawlers.nepsealpha import NepseAlphaCrawler
from app.crawlers.bizmandu import BizManduCrawler
from app.crawlers.market_data import MarketDataCrawler
from app.crawlers.nepsealpha_metrics import NepseAlphaMetricsCrawler

CRAWLER_REGISTRY: Dict[str, Type[BaseCrawler]] = {
    "merolagani": MeroLaganiCrawler,
    "sharesansar": ShareSansarCrawler,
    "nepsealpha": NepseAlphaCrawler,
    "bizmandu": BizManduCrawler,
    "market_data": MarketDataCrawler,
    "nepsealpha_metrics": NepseAlphaMetricsCrawler,
}

def get_crawler(portal_name: str) -> BaseCrawler:
    crawler_cls = CRAWLER_REGISTRY.get(portal_name.lower())
    if not crawler_cls:
        raise ValueError(f"Unknown crawler portal: '{portal_name}'. Available: {list(CRAWLER_REGISTRY.keys())}")
    return crawler_cls()

