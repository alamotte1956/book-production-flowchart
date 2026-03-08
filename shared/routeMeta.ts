/**
 * Server-side route meta data for SEO and social sharing injection.
 * Each entry maps a URL path prefix to a unique set of meta tags that will
 * be injected into index.html before the HTML is sent to the browser/crawler.
 *
 * Rules:
 *  - title: 30–60 characters
 *  - description: 50–160 characters
 *  - keywords: 3–8 comma-separated terms
 *  - ogImage: absolute URL to a 1200×630 image (shared OG image used for all routes)
 */

export interface RouteMeta {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  siteName: string;
}

const BASE = "https://www.createdesignpublish.net";
const SITE_NAME = "Create Design Publish LLC";
const OG_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/og-preview-LrRyvCyZ6fWHwBLgjV9mdz.png";

/** Ordered from most-specific to least-specific so the first match wins. */
export const ROUTE_META: Array<{ path: string; meta: RouteMeta }> = [
  {
    path: "/bible-studio",
    meta: {
      title: "Bible Design Studio — Create Design Publish",
      description:
        "Design any Bible edition online — trim size, paper, binding, typesetting style, journaling margins, and red-letter text. Self-publishing made simple.",
      keywords:
        "Bible design, Bible publishing, self-publishing, book design, typesetting, online publishing",
      canonical: `${BASE}/bible-studio`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
  {
    path: "/spine-calculator",
    meta: {
      title: "Spine Width Calculator — Create Design Publish",
      description:
        "Calculate exact spine width from page count, paper type, and binding method. Free self-publishing tool for print-ready cover design.",
      keywords:
        "spine calculator, spine width, book cover design, self-publishing, print-on-demand, publishing platform",
      canonical: `${BASE}/spine-calculator`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
  {
    path: "/cover-designer",
    meta: {
      title: "Book Cover Designer — Create Design Publish",
      description:
        "Calculate full-wrap cover dimensions with bleed, safe zones, and print-ready specs. Design your book cover online for any trim size.",
      keywords:
        "book cover design, cover designer, self-publishing, online publishing, bleed, safe zone",
      canonical: `${BASE}/cover-designer`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
  {
    path: "/isbn-manager",
    meta: {
      title: "ISBN & Metadata Manager — Create Design Publish",
      description:
        "Manage ISBN, LCCN, BISAC codes, and export ONIX 3.0 XML for distributors. Complete metadata tool for self-publishing authors.",
      keywords:
        "ISBN, ONIX, BISAC, book metadata, self-publishing, online publishing, publishing platform",
      canonical: `${BASE}/isbn-manager`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
  {
    path: "/auto-produce",
    meta: {
      title: "Auto-Produce — AI Book Layout — Create Design Publish",
      description:
        "Generate typeset PDF and EPUB previews instantly with our AI-powered layout engine. Automate book production from manuscript to print-ready file.",
      keywords:
        "AI typesetting, book layout, auto-produce, self-publishing, online publishing, EPUB, PDF",
      canonical: `${BASE}/auto-produce`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
  {
    path: "/timeline",
    meta: {
      title: "Production Timeline — Create Design Publish",
      description:
        "Plan your book production schedule with a Gantt-style timeline, per-step due dates, and deadline risk warnings. Stay on track from manuscript to shelf.",
      keywords:
        "book production timeline, publishing schedule, self-publishing, project management, online publishing",
      canonical: `${BASE}/timeline`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
  {
    path: "/resources",
    meta: {
      title: "Self-Publishing Resources — Create Design Publish",
      description:
        "43 curated self-publishing and online publishing resources — Scrivener, IngramSpark, NetGalley, and more — organized by production phase.",
      keywords:
        "self-publishing resources, online publishing tools, book publishing, IngramSpark, Scrivener, publishing platform",
      canonical: `${BASE}/resources`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
  {
    path: "/guide",
    meta: {
      title: "Self-Publishing Platform Guide — Create Design Publish",
      description:
        "Step-by-step guide to using the Create Design Publish self-publishing platform. Learn how to create, design, and publish your book online.",
      keywords:
        "self-publishing guide, online publishing, book design, create design publish, publishing platform",
      canonical: `${BASE}/guide`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
  {
    path: "/print-specs",
    meta: {
      title: "Print Specs Generator — Create Design Publish",
      description:
        "Generate complete press-ready file specifications for your printer — trim size, bleed, safe zone, color mode, resolution, PDF/X standard, and preflight checklist.",
      keywords:
        "print specs, press-ready, file specifications, bleed, safe zone, PDF/X, self-publishing",
      canonical: `${BASE}/print-specs`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
  {
    path: "/",
    meta: {
      title: "Create Design Publish — Self-Publishing Platform",
      description:
        "Create, design, and publish your book with our all-in-one self-publishing platform. AI typesetting, cover design, ISBN tools, and a 30-step workflow.",
      keywords:
        "self-publishing, online publishing, book design, publishing platform, Bible publishing, create design publish",
      canonical: `${BASE}/`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
    },
  },
];

/** Returns the best-matching RouteMeta for a given URL path. */
export function getRouteMeta(urlPath: string): RouteMeta {
  const clean = urlPath.split("?")[0].split("#")[0];
  for (const { path, meta } of ROUTE_META) {
    if (clean === path || clean.startsWith(path + "/")) {
      return meta;
    }
  }
  // Fallback to home meta
  return ROUTE_META[ROUTE_META.length - 1].meta;
}
