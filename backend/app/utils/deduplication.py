import hashlib
from urllib.parse import urlparse, urlunparse

def canonicalize_url(url: str) -> str:
    if not url:
        return ""
    parsed = urlparse(url.strip())
    # Remove tracking query parameters like utm_source, ref, etc.
    query_parts = [q for q in parsed.query.split("&") if q and not q.startswith(("utm_", "fbclid", "ref"))]
    clean_query = "&".join(query_parts)
    clean_path = parsed.path.rstrip("/")
    return urlunparse((parsed.scheme.lower(), parsed.netloc.lower(), clean_path, parsed.params, clean_query, ""))

def generate_content_hash(headline: str, body: str = "") -> str:
    text = f"{headline.strip().lower()}:{body.strip().lower()[:200]}"
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
