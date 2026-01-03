const fs = require('fs');
const path = require('path');

// Read index.json to get all post filenames
const indexPath = path.join(__dirname, '../public/data/posts/index.json');
const filenames = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

const postsDir = path.join(__dirname, '../public/data/posts');

// Read each post to get its slug field
// Supports both legacy (briefing-YYYY-MM-DD) and descriptive slugs
const slugs = filenames.map(filename => {
  const cleanFilename = filename.replace('.json', '').replace(/^\/+/, '');
  const postPath = path.join(postsDir, `${cleanFilename}.json`);
  const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

  // Use the slug field from the post JSON
  // This supports both legacy and descriptive formats
  return post.slug;
});

// Build sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://6amkick.vercel.app/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://6amkick.vercel.app/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
${slugs.map(slug => `  <url>
    <loc>https://6amkick.vercel.app/posts/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

// Write to public/sitemap.xml
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
console.log('✅ Sitemap generated:', sitemapPath);
console.log(`   Generated ${slugs.length} post URLs`);
