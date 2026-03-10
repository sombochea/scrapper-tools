"""
utils.py — Helper utilities for text extraction and data cleaning.
"""

from __future__ import annotations

import re
from typing import Any


def clean_text(text: str | None) -> str:
    """Strip and collapse whitespace from a string.

    Args:
        text: Raw text string, or None.

    Returns:
        Cleaned string, or empty string if input was None.

    Example::

        clean_text("  Hello   World  ")  # "Hello World"
    """
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def clean_list(items: list[str | None]) -> list[str]:
    """Clean and filter a list of strings, removing empty values.

    Args:
        items: List of raw strings (may contain None or blank entries).

    Returns:
        List of non-empty, whitespace-normalised strings.
    """
    return [c for item in items if (c := clean_text(item))]


def extract_emails(text: str) -> list[str]:
    """Extract all email addresses found in a block of text.

    Args:
        text: Input string to search.

    Returns:
        Deduplicated list of email addresses in lowercase.

    Example::

        extract_emails("Contact us at info@example.com or support@example.com")
        # ["info@example.com", "support@example.com"]
    """
    pattern = r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
    return list(dict.fromkeys(m.lower() for m in re.findall(pattern, text)))


def extract_urls(text: str) -> list[str]:
    """Extract all URLs found in a block of text.

    Args:
        text: Input string to search.

    Returns:
        Deduplicated list of URLs.
    """
    pattern = r"https?://[^\s\"'<>]+"
    return list(dict.fromkeys(re.findall(pattern, text)))


def flatten(data: Any, *, sep: str = ".") -> dict[str, Any]:
    """Recursively flatten a nested dict/list into a single-level dict.

    Args:
        data: Nested dictionary or list.
        sep:  Key separator string (default ``"."``).

    Returns:
        Flat dictionary with dot-separated keys.

    Example::

        flatten({"a": {"b": 1, "c": [2, 3]}})
        # {"a.b": 1, "a.c.0": 2, "a.c.1": 3}
    """
    result: dict[str, Any] = {}

    def _flatten(obj: Any, prefix: str) -> None:
        if isinstance(obj, dict):
            for key, value in obj.items():
                _flatten(value, f"{prefix}{sep}{key}" if prefix else key)
        elif isinstance(obj, list):
            for i, value in enumerate(obj):
                _flatten(value, f"{prefix}{sep}{i}" if prefix else str(i))
        else:
            result[prefix] = obj

    _flatten(data, "")
    return result
