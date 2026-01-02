# Descriptive URL Strategy for 6AMKICK

## Overview
This document defines the URL naming strategy for all future blog posts on 6AMKICK to improve SEO clarity and search engine indexing.

## ⚠️ IMPORTANT: No Breaking Changes
- **DO NOT rename or delete existing post URLs**
- All existing URLs remain valid: `/posts/briefing-YYYY-MM-DD`
- This strategy applies to **NEW POSTS ONLY**

## URL Format for New Posts

### Standard Format
```
/posts/briefing-YYYY-MM-DD-keyword-keyword-keyword
```

### Components
1. **Prefix**: `briefing-` (required)
2. **Date**: `YYYY-MM-DD` (required)
3. **Keywords**: 2-4 topic keywords (recommended)

### Rules
- **Lowercase only**
- **Hyphen-separated** (no underscores or spaces)
- **Max length**: ~75 characters total
- **Keywords**: Derive from title, main topic, or key lesson
- **Fallback**: If keywords unavailable, use `briefing-YYYY-MM-DD`

## Examples

### Good Examples

#### Race Report Post
- **Title**: "When the Clock Doesn't Matter: Racing Through Bad Conditions"
- **Current URL**: `/posts/briefing-2025-12-31`
- **New URL**: `/posts/briefing-2025-12-31-honolulu-marathon-rain`
- **Keywords**: honolulu, marathon, rain

#### Athlete/Event Post
- **Title**: "When the Rules Matter More Than the Results"
- **Current URL**: `/posts/briefing-2026-01-01`
- **New URL**: `/posts/briefing-2026-01-01-world-xc-seb-coe`
- **Keywords**: world-xc, seb-coe

#### Gear Review Post
- **Title**: "Topo Athletic Phantom 4 WP: What you need to know"
- **Current URL**: `/posts/briefing-2025-12-30`
- **New URL**: `/posts/briefing-2025-12-30-topo-phantom-4-waterproof`
- **Keywords**: topo, phantom-4, waterproof

#### Training Insight Post
- **Title**: "The Science Behind Tempo Runs"
- **URL**: `/posts/briefing-2026-01-15-tempo-runs-lactate-threshold`
- **Keywords**: tempo-runs, lactate-threshold

### Bad Examples

❌ `/posts/2026-01-01-world-xc` (missing "briefing-" prefix)
❌ `/posts/briefing-world-xc-2026-01-01` (date not at start)
❌ `/posts/briefing-2026-01-01-World-XC-Seb-Coe` (not lowercase)
❌ `/posts/briefing-2026-01-01_world_xc` (underscores instead of hyphens)
❌ `/posts/briefing-2026-01-01-world-cross-country-championships-sebastian-coe-voting-transparency` (too long, >75 chars)

## Implementation Guide

### For n8n Automation
When creating new posts via your automation:

1. Extract 2-4 keywords from the post title or content
2. Convert keywords to lowercase
3. Replace spaces with hyphens
4. Remove special characters (keep only a-z, 0-9, hyphens)
5. Construct slug: `briefing-YYYY-MM-DD-keyword1-keyword2-keyword3`
6. Set both `id` and `slug` fields to this value in the JSON file

### Manual Post Creation
When creating posts manually:

```json
{
  "id": "briefing-2026-01-15-tempo-runs-lactate-threshold",
  "slug": "briefing-2026-01-15-tempo-runs-lactate-threshold",
  "title": "The Science Behind Tempo Runs",
  ...
}
```

### File Naming
- **JSON filename**: Must match the slug
- Example: `briefing-2026-01-15-tempo-runs-lactate-threshold.json`

## SEO Benefits

### Before (Date-Only)
```
/posts/briefing-2026-01-01
```
- Google sees: generic date-based URL
- No topic indication in URL
- Relies entirely on title tag for context

### After (Descriptive)
```
/posts/briefing-2026-01-01-world-xc-seb-coe
```
- Google sees: topic keywords in URL
- URL itself provides context (world cross country, Sebastian Coe)
- Reinforces page topic before even loading content
- Better keyword targeting
- More likely to rank for specific queries

## Sitemap Handling

The sitemap generation script automatically includes all posts:

```javascript
// scripts/generate-sitemap.cjs
const slugs = filenames.map(filename => filename.replace('.json', '').replace(/^\/+/, ''));
```

- Old URLs: `/posts/briefing-2025-12-31` ✅ Included
- New URLs: `/posts/briefing-2026-01-15-tempo-runs` ✅ Included
- Both work seamlessly

## Canonical URL

Every post includes a canonical URL pointing to its unique slug:

```html
<link rel="canonical" href="https://6amkick.vercel.app/posts/{slug}" />
```

This prevents duplicate content issues and tells Google which URL is authoritative.

## Migration Timeline

- **Existing posts** (briefing-2025-12-30, briefing-2025-12-31, briefing-2026-01-01): NO CHANGES
- **Future posts** (from 2026-01-02 onward): Use descriptive URLs
- **No redirects needed**: Old and new formats coexist safely

## Keyword Selection Guidelines

### Priority Order
1. **Main topic/event**: marathon, world-xc, tempo-runs
2. **Key person/athlete**: seb-coe, kipchoge, hauger-thackery
3. **Core lesson/insight**: rain-racing, lactate-threshold, pacing
4. **Gear/brand** (if applicable): topo, phantom-4, waterproof

### Common Keywords by Category

**Race Reports**
- Event name: `boston-marathon`, `world-xc`, `olympic-trials`
- Conditions: `rain`, `heat`, `altitude`, `windy`
- Notable athletes: `kipchoge`, `hassan`, `cheptegei`

**Training Insights**
- Workout types: `tempo`, `intervals`, `long-run`, `recovery`
- Concepts: `lactate-threshold`, `vo2max`, `base-building`
- Strategies: `pacing`, `periodization`, `taper`

**Gear Reviews**
- Brand: `nike`, `adidas`, `hoka`, `topo`
- Model: `vaporfly`, `alphafly`, `speedgoat`, `phantom`
- Features: `carbon-plate`, `waterproof`, `trail`, `cushioned`

**Opinion/Analysis**
- Topics: `athlete-pay`, `doping`, `olympics`, `prize-money`
- People: `seb-coe`, `phil-knight`, `mo-farah`
- Concepts: `transparency`, `fairness`, `recognition`

## Validation Checklist

Before publishing a new post, verify:

- [ ] Slug starts with `briefing-YYYY-MM-DD`
- [ ] Keywords are lowercase and hyphen-separated
- [ ] Total slug length < 75 characters
- [ ] `id` and `slug` fields match in JSON
- [ ] JSON filename matches the slug
- [ ] No special characters except hyphens
- [ ] Keywords reflect the main topic/lesson

## Questions?

If unsure about keyword selection:
1. What is the main topic? (1-2 words)
2. Who is the key person/athlete? (if applicable)
3. What is the actionable lesson? (1-2 words)

Combine those into 2-4 keywords, and you have your slug.

---

**Last Updated**: 2026-01-02
**Applies To**: All posts published after 2026-01-02
