/**
 * Server-side route meta data for SEO, GEO, and social sharing injection.
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
  jsonLd?: object;
}

const BASE = "https://easybookpublishers.replit.app";
const SITE_NAME = "Easy Book Publishers";
const OG_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/og-preview-LrRyvCyZ6fWHwBLgjV9mdz.png";

const ORG_SCHEMA = {
  "@type": "Organization",
  name: SITE_NAME,
  url: BASE,
  logo: OG_IMAGE,
  sameAs: [],
};

/** Ordered from most-specific to least-specific so the first match wins. */
export const ROUTE_META: Array<{ path: string; meta: RouteMeta }> = [
  {
    path: "/bible-studio",
    meta: {
      title: "Bible Design Studio — Easy Book Publishers",
      description:
        "Design any Bible edition online — trim size, paper, binding, typesetting style, journaling margins, and red-letter text. Self-publishing made simple.",
      keywords:
        "Bible design, Bible publishing, self-publishing, book design, typesetting, online publishing",
      canonical: `${BASE}/bible-studio`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Bible Design Studio",
        description: "Design any Bible edition online — trim size, paper, binding, typesetting style, journaling margins, and red-letter text.",
        url: `${BASE}/bible-studio`,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/spine-calculator",
    meta: {
      title: "Spine Width Calculator — Easy Book Publishers",
      description:
        "Calculate exact spine width from page count, paper type, and binding method. Free self-publishing tool for print-ready cover design.",
      keywords:
        "spine calculator, spine width, book cover design, self-publishing, print-on-demand, publishing platform",
      canonical: `${BASE}/spine-calculator`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Spine Width Calculator",
        description: "Calculate exact spine width from page count, paper type, and binding method for print-ready cover design.",
        url: `${BASE}/spine-calculator`,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/cover-designer",
    meta: {
      title: "Book Cover Designer — Easy Book Publishers",
      description:
        "Calculate full-wrap cover dimensions with bleed, safe zones, and print-ready specs. Design your book cover online for any trim size.",
      keywords:
        "book cover design, cover designer, self-publishing, online publishing, bleed, safe zone",
      canonical: `${BASE}/cover-designer`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Book Cover Designer",
        description: "Calculate full-wrap cover dimensions with bleed, safe zones, and print-ready specs for any trim size.",
        url: `${BASE}/cover-designer`,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/isbn-manager",
    meta: {
      title: "ISBN & Metadata Manager — Easy Book Publishers",
      description:
        "Manage ISBN, LCCN, BISAC codes, and export ONIX 3.0 XML for distributors. Complete metadata tool for self-publishing authors.",
      keywords:
        "ISBN, ONIX, BISAC, book metadata, self-publishing, online publishing, publishing platform",
      canonical: `${BASE}/isbn-manager`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "ISBN & Metadata Manager",
        description: "Manage ISBN, LCCN, BISAC codes, and export ONIX 3.0 XML for book distributors.",
        url: `${BASE}/isbn-manager`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/isbn-lookup",
    meta: {
      title: "ISBN Book Lookup — Easy Book Publishers",
      description:
        "Look up any book by ISBN to retrieve production specs, metadata, and get an instant template recommendation. Free ISBN search tool for publishers.",
      keywords:
        "ISBN lookup, ISBN search, book metadata, production specs, self-publishing, book data",
      canonical: `${BASE}/isbn-lookup`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "ISBN Book Lookup",
        description: "Look up any book by ISBN to retrieve production specifications and metadata.",
        url: `${BASE}/isbn-lookup`,
        applicationCategory: "ReferenceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/templates",
    meta: {
      title: "Book Production Templates — Easy Book Publishers",
      description:
        "Browse 40+ one-click book production templates — Bibles, devotionals, children's books, novels, and more. Pre-configured trim, style, and binding settings.",
      keywords:
        "book templates, publishing templates, Bible templates, self-publishing presets, book design templates",
      canonical: `${BASE}/templates`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Book Production Templates",
        description: "Browse 40+ one-click book production templates for Bibles, devotionals, children's books, novels, and more.",
        url: `${BASE}/templates`,
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/auto-produce",
    meta: {
      title: "Auto-Produce — AI Book Layout — Easy Book Publishers",
      description:
        "Generate typeset PDF and EPUB previews instantly with our AI-powered layout engine. Automate book production from manuscript to print-ready file.",
      keywords:
        "AI typesetting, book layout, auto-produce, self-publishing, online publishing, EPUB, PDF",
      canonical: `${BASE}/auto-produce`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Auto-Produce AI Book Layout",
        description: "Generate typeset PDF and EPUB previews instantly with an AI-powered layout engine.",
        url: `${BASE}/auto-produce`,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/timeline",
    meta: {
      title: "Production Timeline — Easy Book Publishers",
      description:
        "Plan your book production schedule with a Gantt-style timeline, per-step due dates, and deadline risk warnings. Stay on track from manuscript to shelf.",
      keywords:
        "book production timeline, publishing schedule, self-publishing, project management, online publishing",
      canonical: `${BASE}/timeline`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Production Timeline",
        description: "Plan your book production schedule with a Gantt-style timeline and deadline tracking.",
        url: `${BASE}/timeline`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/resources",
    meta: {
      title: "Self-Publishing Resources — Easy Book Publishers",
      description:
        "43 curated self-publishing and online publishing resources — Scrivener, IngramSpark, NetGalley, and more — organized by production phase.",
      keywords:
        "self-publishing resources, online publishing tools, book publishing, IngramSpark, Scrivener, publishing platform",
      canonical: `${BASE}/resources`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Self-Publishing & Online Publishing Resources",
        description: "43 curated self-publishing resources organized by production phase — writing, editing, design, production, marketing, and distribution.",
        url: `${BASE}/resources`,
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/guide",
    meta: {
      title: "Self-Publishing Platform Guide — Easy Book Publishers",
      description:
        "Step-by-step guide to using the Easy Book Publishers self-publishing platform. 13 chapters covering every tool from manuscript to publication.",
      keywords:
        "self-publishing guide, online publishing, book design, easy book publishers, publishing platform, how to publish a book",
      canonical: `${BASE}/guide`,
      ogImage: OG_IMAGE,
      ogType: "article",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Self-Publish a Book with Easy Book Publishers",
        description: "Step-by-step guide covering 13 chapters from manuscript to finished, print-ready book.",
        url: `${BASE}/guide`,
        totalTime: "PT30M",
        step: [
          { "@type": "HowToStep", name: "Getting Started", text: "Create a book project and set up your manuscript." },
          { "@type": "HowToStep", name: "Design & Typesetting", text: "Use Bible Studio or Auto-Produce to typeset your manuscript." },
          { "@type": "HowToStep", name: "Cover Design", text: "Design your full-wrap cover with spine calculator and cover designer." },
          { "@type": "HowToStep", name: "ISBN & Metadata", text: "Assign ISBNs and export ONIX 3.0 XML for distributors." },
          { "@type": "HowToStep", name: "Print & Publish", text: "Generate print-ready PDFs and distribute through KDP, IngramSpark, or other channels." },
        ],
      },
    },
  },
  {
    path: "/print-specs",
    meta: {
      title: "Print Specs Generator — Easy Book Publishers",
      description:
        "Generate complete press-ready file specifications for your printer — trim size, bleed, safe zone, color mode, resolution, PDF/X standard, and preflight checklist.",
      keywords:
        "print specs, press-ready, file specifications, bleed, safe zone, PDF/X, self-publishing",
      canonical: `${BASE}/print-specs`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Print Specs Generator",
        description: "Generate press-ready file specifications — trim size, bleed, color mode, resolution, and PDF/X standard.",
        url: `${BASE}/print-specs`,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/pricing",
    meta: {
      title: "Pricing — Easy Book Publishers",
      description:
        "Simple, transparent pricing for self-publishing. Starter (free), Author Pro ($149), and Publisher ($399) plans with AI typesetting, EPUB/PDF export, and team features.",
      keywords:
        "pricing, self-publishing plans, book publishing pricing, online publishing, publishing platform",
      canonical: `${BASE}/pricing`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Pricing — Easy Book Publishers",
        description: "Transparent pricing for self-publishing — Starter (free), Author Pro ($149), and Publisher ($399).",
        url: `${BASE}/pricing`,
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/guided-journey",
    meta: {
      title: "Publishing Wizard — Easy Book Publishers",
      description:
        "Answer 8 quick questions and get a personalized publishing roadmap tailored to your book type, timeline, and goals. Start your self-publishing journey here.",
      keywords:
        "publishing wizard, self-publishing roadmap, book publishing guide, getting started, publishing journey",
      canonical: `${BASE}/guided-journey`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Publishing Wizard",
        description: "Answer 8 quick questions and get a personalized publishing roadmap for your book.",
        url: `${BASE}/guided-journey`,
        provider: ORG_SCHEMA,
      },
    },
  },
  {
    path: "/",
    meta: {
      title: "Easy Book Publishers — Manuscript to Masterpiece",
      description:
        "Create, design, and publish your book with our all-in-one self-publishing platform. AI typesetting, cover design, ISBN tools, and a 30-step production workflow.",
      keywords:
        "self-publishing, online publishing, book design, publishing platform, Bible publishing, easy book publishers, manuscript to masterpiece",
      canonical: `${BASE}/`,
      ogImage: OG_IMAGE,
      ogType: "website",
      twitterCard: "summary_large_image",
      siteName: SITE_NAME,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${BASE}/#organization`,
            name: SITE_NAME,
            url: BASE,
            logo: {
              "@type": "ImageObject",
              url: OG_IMAGE,
              width: 1200,
              height: 630,
            },
            description: "All-in-one self-publishing platform — from manuscript to masterpiece.",
          },
          {
            "@type": "WebSite",
            "@id": `${BASE}/#website`,
            url: BASE,
            name: SITE_NAME,
            description: "Create, design, and publish your book with AI typesetting, cover design, ISBN tools, and a 30-step production workflow.",
            publisher: { "@id": `${BASE}/#organization` },
          },
          {
            "@type": "SoftwareApplication",
            name: SITE_NAME,
            description: "All-in-one self-publishing platform with AI typesetting, Bible design, cover design, ISBN management, and ONIX 3.0 export.",
            url: BASE,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: [
              { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "USD", description: "Free forever — 1 book project, basic tools" },
              { "@type": "Offer", name: "Author Pro", price: "149", priceCurrency: "USD", description: "Full publishing toolkit with AI typesetting" },
              { "@type": "Offer", name: "Publisher", price: "399", priceCurrency: "USD", description: "For publishing houses and prolific authors" },
            ],
            featureList: [
              "AI-powered book typesetting",
              "Bible Design Studio",
              "Full-wrap cover designer",
              "Spine width calculator",
              "ISBN & metadata manager",
              "ONIX 3.0 XML export",
              "Print-ready PDF generation",
              "EPUB export",
              "KDP-qualified PDF output",
              "InDesign IDML export",
              "30-step production workflow",
              "Print specs generator",
            ],
            provider: { "@id": `${BASE}/#organization` },
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is Easy Book Publishers?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Easy Book Publishers is an all-in-one self-publishing platform that takes your manuscript from raw text to a finished, print-ready book. It includes AI typesetting, cover design tools, ISBN management, and a 30-step production workflow.",
                },
              },
              {
                "@type": "Question",
                name: "Is Easy Book Publishers free to use?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, the Starter plan is free forever and includes 1 book project with access to the Bible Design Studio, Spine Calculator, Cover Designer, ISBN Manager, Print Specs, and Resources Hub. Paid plans (Author Pro at $149 and Publisher at $399) unlock AI typesetting, templates, and unlimited projects.",
                },
              },
              {
                "@type": "Question",
                name: "What file formats does Easy Book Publishers produce?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The platform produces Interior PDF, KDP-qualified Print-Ready PDF (with Amazon bleed/gutter specs), EPUB, and InDesign IDML files — all real, downloadable production files.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need an ISBN to publish a book?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "An ISBN is required for most distribution channels. In the US, ISBNs are purchased from Bowker (myidentifiers.com). A single ISBN costs $125; a block of 10 costs $295. Each format (hardcover, paperback, EPUB) requires its own ISBN.",
                },
              },
              {
                "@type": "Question",
                name: "Can I design a Bible with this platform?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. The Bible Design Studio supports 9 edition types including Standard, Red Letter, Study Bible, Journaling, Large Print, Giant Print, Children's, Pew, and Interlinear editions with full control over trim size, paper, binding, and typesetting style.",
                },
              },
              {
                "@type": "Question",
                name: "What manuscript formats are supported?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Easy Book Publishers accepts 30+ manuscript formats including DOCX, DOC, ODT, RTF, TXT, MD, HTML, EPUB, PDF, CSV, JSON, YAML, and images. You can also paste text directly.",
                },
              },
            ],
          },
        ],
      },
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
  return ROUTE_META[ROUTE_META.length - 1].meta;
}
