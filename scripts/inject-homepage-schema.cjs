const fs = require('fs');
const path = require('path');

/**
 * Injects WebSite + Organization schema into the homepage index.html
 * This ensures Google can see the structured data without JavaScript
 */

const DIST_DIR = path.join(__dirname, '../dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');

// Read the index.html file
let html = fs.readFileSync(INDEX_FILE, 'utf-8');

// Create WebSite + Organization schema
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "6AMKICK",
  "url": "https://6amkick.vercel.app/",
  "description": "A performance-focused running blog covering racing mindset, training insights, and competition at all levels."
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "6AMKICK",
  "url": "https://6amkick.vercel.app/",
  "description": "A performance-focused running blog"
};

// Create the script tags for both schemas
const schemaScripts = `
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(websiteSchema, null, 6)}
    </script>
    <script type="application/ld+json">
${JSON.stringify(organizationSchema, null, 6)}
    </script>
`;

// Inject before the closing </head> tag
html = html.replace('</head>', `${schemaScripts}  </head>`);

// Write back to file
fs.writeFileSync(INDEX_FILE, html);

console.log('✅ Injected WebSite + Organization schema into index.html');
