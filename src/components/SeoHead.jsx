import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://omio.world';
const SITE_NAME = 'OmiO Software Solutions';
const DEFAULT_TITLE = 'OmiO Software Solutions | Enterprise Software & AI';
const DEFAULT_DESCRIPTION =
  'OmiO Software Solutions - enterprise-grade software services, AI agent evaluation, cloud DevOps, and proven case studies from real delivery.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const HREFLANG_CODES = ['en', 'de', 'ja', 'pl', 'uk'];

function setMeta(name, content, attr = 'name') {
  let element = document.querySelector(`meta[${attr}="${name}"]`);

  if (!content) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function setCanonical(href) {
  let element = document.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

export default function SeoHead({ title, description, type = 'website', image }) {
  const { pathname } = useLocation();

  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
  const img = image || DEFAULT_IMAGE;

  useEffect(() => {
    document.title = fullTitle;
    document.documentElement.lang = 'en';

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: pathname, page_title: fullTitle });
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    setMeta('description', desc);
    setMeta('robots', 'index,follow');
    setMeta('theme-color', '#0f172a');
    setCanonical(url);

    document.querySelectorAll('link[hreflang]').forEach((element) => element.remove());
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

    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:image', img, 'property');
    setMeta('og:image:alt', `${fullTitle} preview image`, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [desc, fullTitle, img, pathname, type, url]);

  return null;
}
