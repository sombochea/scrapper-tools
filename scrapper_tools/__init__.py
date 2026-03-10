"""
Scrapper Tools — A mini web scraping toolkit built on top of Scrapling.

Provides:
- Simple HTTP / stealthy / dynamic fetchers
- A reusable Spider base
- Utility helpers for text extraction
"""

from .fetchers import fetch, stealthy_fetch, dynamic_fetch, parse_html
from .spiders import BaseSpider

__all__ = [
    "fetch",
    "stealthy_fetch",
    "dynamic_fetch",
    "parse_html",
    "BaseSpider",
]

__version__ = "0.1.0"
