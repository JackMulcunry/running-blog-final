const fs = require('fs');
const path = require('path');

/**
 * Generates public/sitemap.xml at build time (runs as `prebuild`).
 * public/sitemap.xml is gitignored: this script is the only source of the sitemap.
 *
 * Also validates vercel.json redirects so a post deletion/rename can't silently
 * create redirect chains, redirects to missing posts, or redirects that shadow live posts.
 */

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'public/data/posts');

async function main() {
  const { SITE_URL } = await import('../src/lib/site.js');

  const filenames = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, 'index.json'), 'utf-8'));
  const posts = filenames.map((filename) => {
    const clean = filename.replace(/^\/+/, '').replace(/\.json$/, '');
    const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, `${clean}.json`), 'utf-8'));
    if (post.slug !== clean) {
      throw new Error(`Post file ${clean}.json has slug "${post.slug}" (must match filename)`);
    }
    // Posts only carry a publish date today; prefer an explicit updated date if one is added.
    const lastmod = post.updated || post.dateModified || post.date;
    if (!/^\d{4}-\d{2}-\d{2}/.test(lastmod || '')) {
      throw new Error(`Post ${post.slug} has no valid date`);
    }
    return { slug: post.slug, lastmod: lastmod.slice(0, 10) };
  });

  validateRedirects(new Set(posts.map((p) => p.slug)));

  posts.sort((a, b) => b.lastmod.localeCompare(a.lastmod) || a.slug.localeCompare(b.slug));
  const newest = posts.length ? posts[0].lastmod : null;

  const entries = [
    // Homepage changes whenever a post is published, so use the newest post date.
    { loc: `${SITE_URL}/`, lastmod: newest },
    // /about has no reliable modified date; lastmod is optional, so omit rather than fake it.
    { loc: `${SITE_URL}/about`, lastmod: null },
    ...posts.map((p) => ({ loc: `${SITE_URL}/posts/${p.slug}`, lastmod: p.lastmod })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url>\n    <loc>${escapeXml(e.loc)}</loc>\n${e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : ''}  </url>`,
  )
  .join('\n')}
</urlset>
`;

  const out = path.join(ROOT, 'public/sitemap.xml');
  fs.writeFileSync(out, xml, 'utf-8');
  console.log('✅ Sitemap generated:', out);
  console.log(`   ${entries.length} URLs (${posts.length} posts) on ${SITE_URL}`);
}

function validateRedirects(liveSlugs) {
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf-8'));
  const redirects = vercel.redirects || [];
  const sources = new Set(redirects.map((r) => r.source));
  const errors = [];
  for (const r of redirects) {
    if (sources.has(r.destination)) {
      errors.push(`redirect chain: ${r.source} -> ${r.destination} (which redirects again)`);
    }
    const dest = r.destination.match(/^\/posts\/([^/?#:]+)$/);
    if (dest && !liveSlugs.has(dest[1])) {
      errors.push(`redirect to missing post: ${r.source} -> ${r.destination}`);
    }
    const src = r.source.match(/^\/posts\/([^/?#:]+)$/);
    if (src && liveSlugs.has(src[1])) {
      errors.push(`redirect shadows a live post: ${r.source}`);
    }
  }
  // Trailing slashes are normalised by explicit redirects, not `trailingSlash: false`:
  // Vercel applies trailingSlash before custom redirects, which turned
  // /posts/<old>/ into a 2-hop chain. So every fixed /posts/ source needs a "/" twin
  // with the same destination, and the generic /posts/:slug/ rule must come after them.
  if (vercel.trailingSlash !== undefined) {
    errors.push('remove "trailingSlash" (it chains with redirects); use explicit "/" twins');
  }
  const bySource = new Map(redirects.map((r, i) => [r.source, { ...r, i }]));
  const generic = bySource.get('/posts/:slug/');
  if (!generic) errors.push('missing generic redirect /posts/:slug/ -> /posts/:slug');
  for (const r of redirects) {
    if (!/^\/posts\/[^/:]+$/.test(r.source)) continue;
    const twin = bySource.get(`${r.source}/`);
    if (!twin || twin.destination !== r.destination) {
      errors.push(`missing trailing-slash twin: ${r.source}/ -> ${r.destination}`);
    } else if (generic && twin.i > generic.i) {
      errors.push(`${twin.source} must come before /posts/:slug/`);
    }
  }
  if (errors.length) {
    throw new Error(`vercel.json redirect problems:\n  - ${errors.join('\n  - ')}`);
  }
  console.log(`✅ ${redirects.length} redirects OK (no chains, all targets are live posts)`);
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
