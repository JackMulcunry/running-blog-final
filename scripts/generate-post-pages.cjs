const fs = require('fs');
const path = require('path');

/**
 * Generates static HTML pages for each blog post with proper SEO meta tags
 * This ensures Google can index post-specific content without JavaScript
 */

const DIST_DIR = path.join(__dirname, '../dist');
const POSTS_DIR = path.join(__dirname, '../public/data/posts');
const INDEX_FILE = path.join(POSTS_DIR, 'index.json');
const TEMPLATE_FILE = path.join(DIST_DIR, 'index.html');

// Read the base HTML template
const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

// Read the list of post files
const postFilenames = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));

// Extract asset paths from template
const cssMatch = template.match(/href="(\/assets\/[^"]+\.css)"/);
const jsMatch = template.match(/src="(\/assets\/[^"]+\.js)"/);

if (!cssMatch || !jsMatch) {
  console.error('❌ Could not find asset paths in template');
  process.exit(1);
}

const cssPath = cssMatch[1];
const jsPath = jsMatch[1];

// Load all posts for related posts logic
const allPosts = postFilenames.map(filename => {
  const cleanFilename = filename.replace(/^\/+/, '').replace('.json', '');
  const postPath = path.join(POSTS_DIR, `${cleanFilename}.json`);
  return JSON.parse(fs.readFileSync(postPath, 'utf-8'));
});

let generatedCount = 0;

// Generate HTML for each post
postFilenames.forEach(filename => {
  // Remove leading slash and .json extension
  const cleanFilename = filename.replace(/^\/+/, '').replace('.json', '');

  // Read post data
  const postPath = path.join(POSTS_DIR, `${cleanFilename}.json`);
  const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

  // Find related posts (2 posts with matching tags, or most recent)
  const otherPosts = allPosts.filter(p => p.id !== post.id);
  const postsWithMatchingTags = otherPosts.filter(p =>
    p.tags && p.tags.some && p.tags.some(tag => post.tags && post.tags.includes(tag))
  );

  let relatedPosts = [];
  if (postsWithMatchingTags.length >= 2) {
    relatedPosts = postsWithMatchingTags.slice(0, 2);
  } else if (postsWithMatchingTags.length === 1) {
    relatedPosts = [postsWithMatchingTags[0]];
    const remaining = otherPosts.filter(p => p.id !== relatedPosts[0].id);
    if (remaining.length > 0) {
      remaining.sort((a, b) => new Date(b.date) - new Date(a.date));
      relatedPosts.push(remaining[0]);
    }
  } else {
    otherPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    relatedPosts = otherPosts.slice(0, 2);
  }

  // Generate related posts HTML
  const relatedPostsHtml = relatedPosts.length > 0 ? `
    <div class="related-briefings" style="margin-top: 3rem;">
      <h2 style="font-size: 1.5rem; font-weight: bold; color: #111827; margin-bottom: 1.5rem;">Related Briefings</h2>
      <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
        ${relatedPosts.map(rp => `
          <a href="/posts/${rp.slug}" style="display: block; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; text-decoration: none; color: inherit;">
            <h3 style="font-size: 1.125rem; font-weight: bold; color: #111827; margin-bottom: 0.5rem;">${escapeHtml(rp.title)}</h3>
            <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 0.75rem;">${escapeHtml(rp.excerpt)}</p>
            <div style="font-size: 0.75rem; color: #6b7280;">
              <span>${rp.date}</span>
              <span style="margin: 0 0.5rem;">•</span>
              <span>${rp.readTimeMinutes} min read</span>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  ` : '';

  // Create Article schema JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Organization",
      "name": "6AMKICK"
    },
    "publisher": {
      "@type": "Organization",
      "name": "6AMKICK"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://6amkick.vercel.app/posts/${post.slug}`
    }
  };

  // Create post-specific HTML
  const postHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/6AMKICK.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO Meta Tags -->
    <title>${escapeHtml(post.title)} | 6AMKICK</title>
    <meta name="description" content="${escapeHtml(post.excerpt)}" />
    <link rel="canonical" href="https://6amkick.vercel.app/posts/${post.slug}" />

    <!-- OpenGraph Tags -->
    <meta property="og:title" content="${escapeHtml(post.title)}" />
    <meta property="og:description" content="${escapeHtml(post.excerpt)}" />
    <meta property="og:url" content="https://6amkick.vercel.app/posts/${post.slug}" />
    <meta property="og:type" content="article" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(post.title)}" />
    <meta name="twitter:description" content="${escapeHtml(post.excerpt)}" />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(articleSchema, null, 6)}
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
    <div id="root"></div>
  </body>
</html>`;

  // Create posts directory if it doesn't exist
  const postsOutputDir = path.join(DIST_DIR, 'posts');
  if (!fs.existsSync(postsOutputDir)) {
    fs.mkdirSync(postsOutputDir, { recursive: true });
  }

  // Write post HTML file
  const outputPath = path.join(postsOutputDir, `${post.slug}.html`);
  fs.writeFileSync(outputPath, postHtml);

  generatedCount++;
});

console.log(`✅ Generated ${generatedCount} post HTML pages in dist/posts/`);

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
