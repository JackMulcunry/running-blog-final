# Descriptive URL Strategy for 6AMKICK

## Overview
This document defines the URL naming strategy for all future blog posts on 6AMKICK to improve SEO clarity and search engine indexing.

## ⚠️ IMPORTANT: No Breaking Changes
- **DO NOT rename or delete existing post URLs**
- All existing URLs remain valid: `/posts/briefing-YYYY-MM-DD`
- This strategy applies to **NEW POSTS ONLY**

## URL Format for New Posts

### Standard Format (Descriptive)
```
/posts/keyword-keyword-keyword
```

**OR Legacy Format (Still Supported)**
```
/posts/briefing-YYYY-MM-DD
```

### Rules for Descriptive Slugs
- **Lowercase only**
- **Hyphen-separated** (no underscores or spaces)
- **Max length**: ~60 characters total
- **Keywords**: Derive from title, main topic, or key lesson (2-5 words)
- **No dates required**: Dates are metadata, not part of URL

### How Slugs Work
Each post JSON file has a `slug` field that defines its URL path. The build system uses this field to:
1. Generate the static HTML file
2. Add the post to the sitemap
3. Create the canonical URL

## Examples

### Good Examples (Descriptive Slugs)

#### Race Report Post
- **Title**: "When the Clock Doesn't Matter: Racing Through Bad Conditions"
- **Slug**: `honolulu-marathon-rain-conditions`
- **URL**: `/posts/honolulu-marathon-rain-conditions`

#### Athlete/Event Post
- **Title**: "When the Rules Matter More Than the Results"
- **Slug**: `world-xc-seb-coe-voting`
- **URL**: `/posts/world-xc-seb-coe-voting`

#### Gear Review Post
- **Title**: "Topo Athletic Phantom 4 WP: What you need to know"
- **Slug**: `topo-phantom-4-waterproof-review`
- **URL**: `/posts/topo-phantom-4-waterproof-review`

#### Training Insight Post
- **Title**: "The Science Behind Tempo Runs"
- **Slug**: `tempo-runs-lactate-threshold-science`
- **URL**: `/posts/tempo-runs-lactate-threshold-science`

### Legacy Format (Existing Posts - Do NOT Change)

#### Examples of Current Posts
- **Title**: "Topo Athletic Phantom 4 WP"
- **Slug**: `briefing-2025-12-30`
- **URL**: `/posts/briefing-2025-12-30` ✅ Kept as-is

### Bad Examples

❌ `/posts/World-XC-Seb-Coe` (not lowercase)
❌ `/posts/world_xc_seb_coe` (underscores instead of hyphens)
❌ `/posts/world-cross-country-championships-sebastian-coe-voting-transparency-debate` (too long, >60 chars)
❌ `/posts/xc` (too short, not descriptive enough)

## Implementation Guide

### Using the Slug Generator Script
Generate SEO-friendly slugs from titles:

```bash
node scripts/generate-slug.cjs "Your Post Title Here"
# Output: your-post-title-here
```

### For n8n Automation
When creating new posts via your automation:

1. Use the slug generator script or implement the same logic:
   - Convert title to lowercase
   - Replace spaces and special chars with hyphens
   - Max 60 characters
2. Set the `slug` field in the JSON to the generated slug
3. Keep `id` as the legacy format for backward compatibility: `briefing-YYYY-MM-DD`
4. Name the JSON file using the `id` field (legacy format)

### Manual Post Creation
When creating posts manually:

```json
{
  "id": "briefing-2026-01-15",
  "slug": "tempo-runs-lactate-threshold-science",
  "title": "The Science Behind Tempo Runs",
  "excerpt": "Understanding how tempo runs improve your lactate threshold...",
  "date": "2026-01-15",
  ...
}
```

### File Naming
- **JSON filename**: Use the legacy `id` format for consistency
- **Example**: `briefing-2026-01-15.json`
- The `slug` field inside determines the actual URL path

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

- [ ] `slug` is lowercase and hyphen-separated
- [ ] `slug` length is between 10-60 characters
- [ ] `id` uses legacy format: `briefing-YYYY-MM-DD`
- [ ] JSON filename matches the `id` field
- [ ] No special characters in slug except hyphens
- [ ] Slug keywords reflect the main topic/lesson
- [ ] Both `id` and `slug` fields present in JSON

## Questions?

If unsure about keyword selection:
1. What is the main topic? (1-2 words)
2. Who is the key person/athlete? (if applicable)
3. What is the actionable lesson? (1-2 words)

Combine those into 2-4 keywords, and you have your slug.

---

**Last Updated**: 2026-01-02
**Applies To**: All posts published after 2026-01-02
