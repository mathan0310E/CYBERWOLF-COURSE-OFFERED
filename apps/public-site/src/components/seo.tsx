import { useEffect } from "react";
import { COMPANY } from "@cyberwolf/shared-types";

interface SeoProps {
  title: string;
  description: string;
  /** Route path, e.g. "/courses". Used to build the canonical URL. */
  path: string;
  /** When true the page is excluded from search indexing. */
  noindex?: boolean;
}

const SITE_URL = COMPANY.website;

function setMeta(attr: "name" | "property", key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Lightweight per-route document metadata. The SPA shares one index.html, so
 * each page updates the title, description, canonical URL and social tags.
 */
export function Seo({ title, description, path, noindex = false }: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(COMPANY.displayName) ? title : `${title} — ${COMPANY.displayName}`;
    const canonical = `${SITE_URL}${path === "/" ? "/" : path}`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setLink("canonical", canonical);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", COMPANY.displayName);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
  }, [title, description, path, noindex]);

  return null;
}
