const fs = require('fs');
const path = require('path');

/**
 * Verifies and ensures WebSite + Organization schema exists in the homepage index.html
 * The schema is now included in the source index.html, so this script just validates
 * and logs the result. If schema is missing (shouldn't happen), it adds it.
 */

const DIST_DIR = path.join(__dirname, '../dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');

// Read the index.html file
let html = fs.readFileSync(INDEX_FILE, 'utf-8');

// Check if schema already exists (it should, from source index.html)
const hasWebSiteSchema = html.includes('"@type": "WebSite"') || html.includes('"@type":"WebSite"');
const hasOrganizationSchema = html.includes('"@type": "Organization"') || html.includes('"@type":"Organization"');

if (hasWebSiteSchema && hasOrganizationSchema) {
  console.log('✅ WebSite + Organization schema already present in index.html');
} else {
  // Fallback: inject schema if missing (shouldn't happen with updated index.html)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "6AMKICK",
    "alternateName": "6AM KICK",
    "url": "https://6amkick.vercel.app",
    "description": "Your 6AM running briefing. One story. One lesson. One thing to try today.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://6amkick.vercel.app/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "6AMKICK",
    "url": "https://6amkick.vercel.app",
    "logo": "https://6amkick.vercel.app/favicon-512.png",
    "sameAs": []
  };

  const schemaScripts = `
    <!-- JSON-LD Structured Data (fallback injection) -->
    <script type="application/ld+json">
${JSON.stringify(websiteSchema, null, 6)}
    </script>
    <script type="application/ld+json">
${JSON.stringify(organizationSchema, null, 6)}
    </script>
`;

  html = html.replace('</head>', `${schemaScripts}  </head>`);
  fs.writeFileSync(INDEX_FILE, html);
  console.log('✅ Injected WebSite + Organization schema into index.html (fallback)');
}
