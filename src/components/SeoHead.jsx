import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://omio.world';
const SITE_NAME = 'OmiO Software Solutions';
const DEFAULT_TITLE = 'OmiO Software Solutions | Enterprise Software & AI';
const DEFAULT_DESCRIPTION =
  'OmiO Software Solutions — enterprise-grade software services, AI agent evaluation, cloud DevOps, and proven case studies from real delivery.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const HREFLANG_CODES = ['en', 'de', 'ja', 'pl', 'uk'];

function setMeta(name, content, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function SeoHead({ title, description, type = 'website', image }) {
  const { pathname } = useLocation();

  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
  const img = image || DEFAULT_IMAGE;

  useEffect(() => {
    document.title = fullTitle;

    // GA4 SPA page view tracking
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: pathname, page_title: fullTitle });
    }

    // Meta (Facebook) Pixel SPA page view tracking
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    // Standard meta
    setMeta('description', desc);

    // Canonical
    setCanonical(url);

    // Hreflang tags
    document.querySelectorAll('link[hreflang]').forEach((el) => el.remove());
    HREFLANG_CODES.forEach((code) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', code);
      link.setAttribute('href', url);
      document.head.appendChild(link);
    });
    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', url);
    document.head.appendChild(xDefault);

    // Open Graph
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:image', img, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');

    // Twitter Card
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, desc, url, type, img]);

  return null;
}
