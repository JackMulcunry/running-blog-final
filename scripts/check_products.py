#!/usr/bin/env python3
"""Check product specs in posts against src/data/products.json.

    python3 scripts/check_products.py            # all posts
    python3 scripts/check_products.py SLUG ...   # only these posts

Fails (exit 1) when:
  - a sentence or table row that names exactly one product states a price, battery
    figure, weight, drop, stack height or storage size that differs from the data file;
  - a superseded product is recommended: named in a heading (h2-h4) or a table row label.
Warns when:
  - a product entry's last_checked is older than 6 months;
  - a sentence names several products and also contains spec numbers (can't attribute them);
  - a superseded product is mentioned in passing (fine for "replaces the X", worth a look).

Prices in posts are compared with msrp_usd (plus other_prices, e.g. a second size).
"""
import datetime
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src/data/products.json"
POSTS = ROOT / "public/data/posts"
STALE_DAYS = 183

products = json.loads(DATA.read_text())["products"]
by_id = {p["id"]: p for p in products}

# Longest aliases first so "Pace 4 Pro" wins over "Pace 4" and "Forerunner 170 Music" over "Forerunner 170".
alias_list = sorted(
    ((a, p["id"]) for p in products for a in {p["name"], *p.get("aliases", [])}),
    key=lambda t: -len(t[0]),
)
alias_res = [(re.compile(r"(?<![\w-])" + re.escape(a) + r"(?![\w])", re.I), pid) for a, pid in alias_list]


def find_products(text):
    taken, found = [], []
    for rx, pid in alias_res:
        for m in rx.finditer(text):
            if any(s < m.end() and m.start() < e for s, e in taken):
                continue
            taken.append((m.start(), m.end()))
            found.append(pid)
    return list(dict.fromkeys(found))


def num(s):
    return float(s.replace(",", ""))


SPEC_PATTERNS = {
    "price": re.compile(r"\$(\d[\d,]*(?:\.\d{1,2})?)"),
    "hours": re.compile(r"(\d+(?:\.\d+)?)\s*(?:hours|hrs|hr|h)\b", re.I),
    "days": re.compile(r"(\d+(?:\.\d+)?)\s*days\b", re.I),
    "grams": re.compile(r"(\d+(?:\.\d+)?)\s*(?:g|grams)\b"),
    "drop": re.compile(r"(\d+(?:\.\d+)?)\s*mm\s+(?:heel[- ]to[- ]toe\s+)?(?:heel\s+)?drop\b", re.I),
    "stack": re.compile(r"(\d+(?:\.\d+)?)\s*mm\s+(?:heel\s+)?stack|heel stack (?:of\s+)?(?:about\s+)?(\d+(?:\.\d+)?)\s*mm", re.I),
    "gb": re.compile(r"(\d+)\s*GB\b"),
}


def allowed(p, kind):
    if kind == "price":
        return {p.get("msrp_usd"), *p.get("other_prices", [])} - {None}
    if kind == "hours":
        return {v for k, v in p.items() if k.startswith("battery_") and k.endswith("_h")}
    if kind == "days":
        return {p.get("battery_smartwatch_days")} - {None}
    if kind == "grams":
        return {p.get("weight_g")} - {None}
    if kind == "drop":
        return {p.get("drop_mm")} - {None}
    if kind == "stack":
        return {p.get("stack_heel_mm")} - {None}
    if kind == "gb":
        return {p.get("music_storage_gb")} - {None}
    return set()


def spec_hits(text):
    hits = []
    for kind, rx in SPEC_PATTERNS.items():
        for m in rx.finditer(text):
            val = next(g for g in m.groups() if g)
            hits.append((kind, num(val), m.group(0)))
    return hits


def units(body):
    """Yield (kind, text) units: one per table row, one per sentence in other blocks."""
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", body, re.S):
        cells = [html.unescape(re.sub(r"<[^>]+>", " ", c)).strip() for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", row, re.S)]
        if cells:
            yield "row", cells
    body = re.sub(r"<table.*?</table>", " ", body, flags=re.S)
    for tag, inner in re.findall(r"<(h[2-4]|p|li)[^>]*>(.*?)</\1>", body, re.S):
        text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", inner))).strip()
        if tag.startswith("h"):
            yield "heading", text
        else:
            for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", text):
                yield "sentence", s


def check_post(path):
    errors, warnings = [], []
    post = json.loads(path.read_text())
    if not isinstance(post, dict):
        return errors, warnings
    slug = post.get("slug", path.stem)
    body = post.get("body") or ""
    for kind, unit in units(body):
        if kind == "row":
            pids = find_products(unit[0])
            text = " | ".join(unit[1:])
            label = unit[0]
        else:
            pids = find_products(unit)
            text = unit
            label = unit
        for pid in pids:
            p = by_id[pid]
            if p["status"] == "superseded":
                succ = by_id.get(p.get("successor") or "", {}).get("name", "a newer model")
                if kind in ("heading", "row"):
                    errors.append(f"{slug}: recommends superseded {p['name']} (successor: {succ}) in {kind}: {label[:90]!r}")
                else:
                    warnings.append(f"{slug}: mentions superseded {p['name']}: {label[:90]!r}")
        if kind == "heading":
            continue
        hits = spec_hits(text)
        if not hits:
            continue
        if len(pids) != 1:
            if len(pids) > 1:
                warnings.append(f"{slug}: spec numbers in a unit naming {len(pids)} products (not checked): {text[:100]!r}")
            continue
        p = by_id[pids[0]]
        for kind_, val, raw in hits:
            ok = allowed(p, kind_)
            if not ok:
                errors.append(f"{slug}: {p['name']}: {kind_} {raw!r} stated but products.json has no {kind_} value — add it with a source or remove it from the post")
            elif not any(abs(val - a) < 0.005 for a in ok):
                errors.append(f"{slug}: {p['name']}: {kind_} {raw!r} != products.json {sorted(ok)}")
    return errors, warnings


def main(argv):
    errors, warnings = [], []
    today = datetime.date.today()
    for p in products:
        checked = datetime.date.fromisoformat(p["last_checked"])
        if (today - checked).days > STALE_DAYS:
            warnings.append(f"products.json: {p['name']} last_checked {p['last_checked']} is older than 6 months")
        if p["status"] == "superseded" and p.get("successor") and p["successor"] not in by_id:
            errors.append(f"products.json: {p['name']} successor {p['successor']!r} not found")
    if argv:
        paths = [POSTS / f"{s}.json" for s in argv]
    else:
        # Live posts only: index.json lists them; unlisted files are redirected and never rendered.
        live = json.loads((POSTS / "index.json").read_text())
        paths = [POSTS / (f.strip("/")) for f in live]
    for path in paths:
        if path.name == "index.json":
            continue
        e, w = check_post(path)
        errors += e
        warnings += w
    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("FAIL ", e)
    print(f"\n{len(paths)} posts, {len(products)} products: {len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
