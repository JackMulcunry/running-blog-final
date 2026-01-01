const fs = require('fs');
const path = require('path');

// Read index.json to get all posts
const indexPath = path.join(__dirname, '../public/data/posts/index.json');
const filenames = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

// Extract slugs from filenames (remove .json extension and leading slashes)
const slugs = filenames.map(filename => filename.replace('.json', '').replace(/^\/+/, ''));

// Build sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://6amkick.vercel.app/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
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
