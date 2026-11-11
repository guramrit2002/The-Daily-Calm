"""Read RSS 2.0 / Atom feeds and print normalised items as JSON.

Standalone helper for trying out sources before they are added to the
`sources` app. Uses only the standard library.

Per the content rules, only metadata is kept: title, URL, published_at,
a short plain-text snippet and the feed it came from. Full article text
(e.g. <content:encoded>) is deliberately ignored.

Usage:
    python scripts/read_rss.py https://example.com/feed.xml [more URLs...]
    python scripts/read_rss.py --file feeds.txt --limit 5
    python scripts/read_rss.py URL --category tech --pretty
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from xml.etree import ElementTree as ET

USER_AGENT = "DailyCalmFeedReader/0.1"
TIMEOUT_SECONDS = 15
MAX_SNIPPET_CHARS = 280
MAX_RESPONSE_BYTES = 5 * 1024 * 1024

ATOM_NS = "{http://www.w3.org/2005/Atom}"
DC_NS = "{http://purl.org/dc/elements/1.1/}"

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


@dataclass
class FeedItem:
    title: str
    url: str
    published_at: str | None  # ISO 8601, UTC
    snippet: str
    feed_url: str
    category_hint: str | None


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
        data = resp.read(MAX_RESPONSE_BYTES + 1)
    if len(data) > MAX_RESPONSE_BYTES:
        raise ValueError(f"feed larger than {MAX_RESPONSE_BYTES} bytes")
    return data


def clean_text(raw: str | None, max_chars: int | None = None) -> str:
    """Strip HTML tags/entities, collapse whitespace, optionally truncate on a word boundary."""
    if not raw:
        return ""
    text = _WS_RE.sub(" ", html.unescape(_TAG_RE.sub(" ", raw))).strip()
    if max_chars and len(text) > max_chars:
        text = text[:max_chars].rsplit(" ", 1)[0].rstrip(",.;:") + "…"
    return text


def parse_date(raw: str | None) -> str | None:
    """Parse RFC 822 (RSS) or ISO 8601 (Atom) dates into a UTC ISO string."""
    if not raw:
        return None
    raw = raw.strip()
    dt: datetime | None = None
    try:
        dt = parsedate_to_datetime(raw)
    except (TypeError, ValueError):
        try:
            dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        except ValueError:
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def _text(el: ET.Element | None, path: str) -> str | None:
    if el is None:
        return None
    found = el.find(path)
    return found.text if found is not None and found.text else None


def parse_rss(root: ET.Element, feed_url: str, category: str | None) -> list[FeedItem]:
    items: list[FeedItem] = []
    for item in root.iter("item"):
        url = (_text(item, "link") or _text(item, "guid") or "").strip()
        title = clean_text(_text(item, "title"))
        if not url or not title:
            continue
        items.append(
            FeedItem(
                title=title,
                url=url,
                published_at=parse_date(_text(item, "pubDate") or _text(item, f"{DC_NS}date")),
                snippet=clean_text(_text(item, "description"), MAX_SNIPPET_CHARS),
                feed_url=feed_url,
                category_hint=category,
            )
        )
    return items


def parse_atom(root: ET.Element, feed_url: str, category: str | None) -> list[FeedItem]:
    items: list[FeedItem] = []
    for entry in root.iter(f"{ATOM_NS}entry"):
        url = ""
        for link in entry.findall(f"{ATOM_NS}link"):
            if link.get("rel", "alternate") == "alternate" and link.get("href"):
                url = link.get("href", "").strip()
                break
        title = clean_text(_text(entry, f"{ATOM_NS}title"))
        if not url or not title:
            continue
        items.append(
            FeedItem(
                title=title,
                url=url,
                published_at=parse_date(
                    _text(entry, f"{ATOM_NS}published") or _text(entry, f"{ATOM_NS}updated")
                ),
                snippet=clean_text(_text(entry, f"{ATOM_NS}summary"), MAX_SNIPPET_CHARS),
                feed_url=feed_url,
                category_hint=category,
            )
        )
    return items


def read_feed(url: str, category: str | None = None) -> list[FeedItem]:
    root = ET.fromstring(fetch(url))
    if root.tag == f"{ATOM_NS}feed":
        return parse_atom(root, url, category)
    return parse_rss(root, url, category)


def dedupe(items: list[FeedItem]) -> list[FeedItem]:
    """Drop exact URL duplicates (the real pipeline also checks title similarity)."""
    seen: set[str] = set()
    unique: list[FeedItem] = []
    for item in items:
        if item.url not in seen:
            seen.add(item.url)
            unique.append(item)
    return unique


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Read RSS/Atom feeds and print items as JSON.")
    parser.add_argument("urls", nargs="*", help="Feed URLs")
    parser.add_argument("--file", help="Text file with one feed URL per line (# for comments)")
    parser.add_argument("--category", help="Category hint to attach (india/world/tech/sports)")
    parser.add_argument("--limit", type=int, default=0, help="Max items per feed (0 = all)")
    parser.add_argument("--pretty", action="store_true", help="Indent JSON output")
    args = parser.parse_args(argv)

    urls: list[str] = list(args.urls)
    if args.file:
        with open(args.file, encoding="utf-8") as fh:
            urls += [ln.strip() for ln in fh if ln.strip() and not ln.lstrip().startswith("#")]
    if not urls:
        parser.error("provide at least one feed URL or --file")

    all_items: list[FeedItem] = []
    failures = 0
    for url in urls:
        try:
            items = read_feed(url, args.category)
        except Exception as exc:  # noqa: BLE001 - report and continue with other feeds
            failures += 1
            print(f"error: {url}: {exc}", file=sys.stderr)
            continue
        if args.limit:
            items = items[: args.limit]
        print(f"ok: {url}: {len(items)} items", file=sys.stderr)
        all_items.extend(items)

    json.dump(
        [asdict(i) for i in dedupe(all_items)],
        sys.stdout,
        ensure_ascii=False,
        indent=2 if args.pretty else None,
    )
    sys.stdout.write("\n")
    return 1 if failures == len(urls) else 0


if __name__ == "__main__":
    sys.exit(main())
