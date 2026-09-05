import re

def normalize_whitespace(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def strip_html(html_content: str) -> str:
    if not html_content:
        return ""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', html_content).strip()
