// Single source of truth for the public site origin.
// Imported by the React app AND by the Node build scripts (sitemap, static post pages),
// so canonical tags, og:url, JSON-LD and the sitemap can never disagree.
//
// Must be the exact host the site is served from (Vercel redirects 6amkick.com -> www).
// No trailing slash.
export const SITE_URL = "https://www.6amkick.com";

/** Absolute URL for a site path, e.g. absoluteUrl("/posts/foo"). */
export function absoluteUrl(path = "/") {
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
}

/** Shared by src/pages/About.tsx (Helmet) and the build-time dist/about.html. */
export const ABOUT_PAGE = {
  title: "About 6AMKICK | Performance-Focused Running Blog",
  description:
    "Learn about 6AMKICK, a running blog dedicated to racing, training, and competitive mindset with daily briefings focused on real racing conditions.",
};
