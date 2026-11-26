const fs = require('fs');
const path = require('path');

/**
 * Runs after `vite build`. Writes a static HTML file per post (dist/posts/<slug>.html)
 * with SEO tags AND a server-rendered copy of the article, topic-cluster links and
 * related links inside #root, so crawlers get real content and real <a href> links
 * without executing JavaScript. React replaces #root on load.
 *
 * Also prerenders a crawlable list of every post into dist/index.html (the homepage).
 *
 * Link selection comes from src/lib/related.js, the same module the React post page
 * uses, so raw HTML and rendered DOM always link to the same posts.
 */

const DIST_DIR = path.join(__dirname, '../dist');
const POSTS_DIR = path.join(__dirname, '../public/data/posts');
const INDEX_FILE = path.join(POSTS_DIR, 'index.json');
const TEMPLATE_FILE = path.join(DIST_DIR, 'index.html');
const ROOT_EMPTY = '<div id="root"></div>';

// Loaded in main() (ESM module shared with the client).
let sanitizePostBody;

async function main() {
  const { SITE_URL, ABOUT_PAGE } = await import('../src/lib/site.js');
  const { getPostLinks } = await import('../src/lib/related.js');
  ({ sanitizePostBody } = await import('../src/lib/postBody.js'));

  const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
  const cssMatch = template.match(/href="(\/assets\/[^"]+\.css)"/);
  const jsMatch = template.match(/src="(\/assets\/[^"]+\.js)"/);
  if (!cssMatch || !jsMatch || !template.includes(ROOT_EMPTY)) {
    throw new Error('Could not find asset paths / empty #root in dist/index.html');
  }
  const cssPath = cssMatch[1];
  const jsPath = jsMatch[1];

  const allPosts = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8')).map((filename) => {
    const clean = filename.replace(/^\/+/, '').replace(/\.json$/, '');
    return JSON.parse(fs.readFileSync(path.join(POSTS_DIR, `${clean}.json`), 'utf-8'));
  });

  const postsOutputDir = path.join(DIST_DIR, 'posts');
  fs.mkdirSync(postsOutputDir, { recursive: true });

  for (const post of allPosts) {
    const url = `${SITE_URL}/posts/${post.slug}`;
    const { topic, topicPosts, related } = getPostLinks(post, allPosts);

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      url,
      author: { '@type': 'Organization', name: '6AMKICK', url: `${SITE_URL}/` },
      publisher: { '@type': 'Organization', name: '6AMKICK', url: `${SITE_URL}/` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    };

    const postHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/6AMKICK.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO Meta Tags -->
    <title>${escapeHtml(post.title)} | 6AMKICK</title>
    <meta name="description" content="${escapeHtml(post.excerpt)}" />
    <link rel="canonical" href="${url}" />

    <!-- OpenGraph Tags -->
    <meta property="og:title" content="${escapeHtml(post.title)}" />
    <meta property="og:description" content="${escapeHtml(post.excerpt)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="6AMKICK" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(post.title)}" />
    <meta name="twitter:description" content="${escapeHtml(post.excerpt)}" />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(articleSchema, null, 6).replace(/</g, '\\u003c')}
    </script>

    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-6R18TR07S3"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6R18TR07S3', {
        send_page_view: false
      });
    </script>

    <!-- Assets -->
    <script type="module" crossorigin src="${jsPath}"></script>
    <link rel="stylesheet" crossorigin href="${cssPath}">
  </head>
  <body>
    <div id="root">${renderPostBody(post, topic, topicPosts, related)}</div>
  </body>
</html>`;

    fs.writeFileSync(path.join(postsOutputDir, `${post.slug}.html`), postHtml);
  }
  console.log(`✅ Generated ${allPosts.length} post HTML pages in dist/posts/`);

  // /about: its own HTML (title, description, canonical) instead of the homepage shell.
  fs.writeFileSync(path.join(DIST_DIR, 'about.html'), renderAbout(template, SITE_URL, ABOUT_PAGE));
  console.log('✅ Generated dist/about.html');

  // Homepage: crawlable list of every post (newest first) inside #root.
  const byDate = [...allPosts].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const homeHtml = template.replace(
    ROOT_EMPTY,
    `<div id="root"><div class="pt-[60px] sm:pt-[64px]"><main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<h1 class="font-extrabold text-[#1a1a1a] mb-6 leading-tight text-3xl">6AMKICK: A Performance-Focused Running Blog</h1>
<h2 class="text-xs uppercase tracking-[0.12em] font-bold text-gray-400 mb-6">All Briefings</h2>
<ul>
${byDate.map((p) => `<li><a href="/posts/${p.slug}">${escapeHtml(p.title)}</a> <span class="text-xs text-gray-400">${p.date}</span></li>`).join('\n')}
</ul>
<p class="mt-10"><a href="/about">About 6AMKICK</a></p>
</main></div></div>`,
  );
  fs.writeFileSync(TEMPLATE_FILE, homeHtml);
  console.log(`✅ Prerendered ${byDate.length} post links into dist/index.html`);
}

function renderAbout(template, siteUrl, page) {
  const url = `${siteUrl}/about`;
  const t = escapeHtml(page.title);
  const d = escapeHtml(page.description);
  const replacements = [
    [/<title>[^<]*<\/title>/, `<title>${t}</title>`],
    [/(<meta name="title" content=")[^"]*/, `$1${t}`],
    [/(<meta name="description" content=")[^"]*/, `$1${d}`],
    [/(<meta property="og:url" content=")[^"]*/, `$1${url}`],
    [/(<meta property="og:title" content=")[^"]*/, `$1${t}`],
    [/(<meta property="og:description" content=")[^"]*/, `$1${d}`],
    [/(<meta name="twitter:url" content=")[^"]*/, `$1${url}`],
    [/(<meta name="twitter:title" content=")[^"]*/, `$1${t}`],
    [/(<meta name="twitter:description" content=")[^"]*/, `$1${d}`],
  ];
  let html = template;
  for (const [re, value] of replacements) {
    if (!re.test(html)) throw new Error(`about.html: template is missing ${re}`);
    html = html.replace(re, value);
  }
  return html
    .replace('</head>', `  <link rel="canonical" href="${url}" />\n  </head>`)
    .replace(
      ROOT_EMPTY,
      `<div id="root"><div class="pt-[60px] sm:pt-[64px]"><main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<h1 class="font-extrabold text-[#1a1a1a] mb-6 leading-tight text-3xl">About 6AMKICK</h1>
<p>${d}</p>
<p class="mt-10"><a href="/">See all briefings</a></p>
</main></div></div>`,
    );
}

function renderPostBody(post, topic, topicPosts, related) {
  // Same cleanup as the client (drops the body's <h1>, converts "---", Markdown tables,
  // reference labels) so the raw HTML matches what readers see.
  const body = sanitizePostBody(String(post.body || ''));
  const card = (p) => `
          <a href="/posts/${p.slug}" class="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 group">
            <h3 class="text-base font-bold text-[#1a1a1a] mb-2 leading-snug tracking-tight">${escapeHtml(p.title)}</h3>
            <p class="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">${escapeHtml(p.excerpt)}</p>
            <div class="flex items-center gap-3 text-xs text-gray-400"><span>${p.date}</span><span>·</span><span>${p.readTimeMinutes} min read</span></div>
          </a>`;
  const section = (title, posts, cls) =>
    posts.length
      ? `
      <section class="mt-12 ${cls}">
        <h2 class="text-xs uppercase tracking-[0.12em] font-bold text-gray-400 mb-6">${escapeHtml(title)}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">${posts.map(card).join('')}
        </div>
      </section>`
      : '';

  return `<div class="pt-[60px] sm:pt-[64px]"><div class="min-h-screen bg-amber-50/60"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav class="mb-8"><a href="/">← All Briefings</a></nav>
      <article class="rounded-xl shadow-sm p-7 sm:p-12 bg-white border border-gray-100">
        <p class="mb-5 text-[10px] uppercase tracking-[0.1em] font-bold">${escapeHtml(post.category)}</p>
        <h1 class="font-extrabold text-[#1a1a1a] mb-6 leading-tight tracking-[-0.02em] text-3xl sm:text-[2.6rem]">${escapeHtml(post.title)}</h1>
        <p class="mb-8 text-sm text-gray-500"><time datetime="${post.date}">${post.date}</time> · ${post.readTimeMinutes} min read</p>
        ${post.keyTakeaway ? `<p class="my-8 p-5 border-l-4 rounded-r-lg bg-amber-50 border-brand-orange"><strong>Key Takeaway:</strong> ${escapeHtml(post.keyTakeaway)}</p>` : ''}
        <div class="prose prose-lg max-w-none">${body}</div>
      </article>${topic ? section(`More ${topic.title}`, topicPosts, 'topic-posts') : ''}${section('Related Briefings', related, 'related-briefings')}
      <nav class="mt-10"><a href="/">Back to All Briefings</a></nav>
    </div></div></div>`;
}

/** Escapes HTML special characters. */
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text ?? '').replace(/[&<>"']/g, (m) => map[m]);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
