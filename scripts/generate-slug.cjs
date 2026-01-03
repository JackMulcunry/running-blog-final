/**
 * Helper utility to generate SEO-friendly descriptive slugs from post titles
 *
 * Usage:
 *   node scripts/generate-slug.cjs "Your Post Title Here"
 *
 * Rules:
 *   - Converts to lowercase
 *   - Replaces spaces and special characters with hyphens
 *   - Removes consecutive hyphens
 *   - Trims to max 60 characters
 *   - Removes trailing hyphens
 */

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-')            // Replace consecutive hyphens with single hyphen
    .substring(0, 60)               // Max 60 characters
    .replace(/^-+|-+$/g, '');       // Remove leading/trailing hyphens
}

// CLI usage
if (require.main === module) {
  const title = process.argv.slice(2).join(' ');

  if (!title) {
    console.error('Usage: node scripts/generate-slug.cjs "Your Post Title"');
    process.exit(1);
  }

  const slug = generateSlug(title);
  console.log(slug);
}

module.exports = { generateSlug };
