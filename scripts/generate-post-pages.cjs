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

let generatedCount = 0;

// Generate HTML for each post
postFilenames.forEach(filename => {
  // Remove leading slash and .json extension
  const cleanFilename = filename.replace(/^\/+/, '').replace('.json', '');

  // Read post data
  const postPath = path.join(POSTS_DIR, `${cleanFilename}.json`);
  const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

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
