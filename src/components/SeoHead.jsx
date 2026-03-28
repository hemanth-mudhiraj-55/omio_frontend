import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://omio.world';
const SITE_NAME = 'Omio Solutions';
const DEFAULT_TITLE = 'Omio Solutions — Enterprise Software & AI Services';
const DEFAULT_DESCRIPTION =
  'Omio Solutions delivers enterprise-grade software engineering, AI agent evaluation, and cloud services. Web development, mobile apps, DevOps, RLHF, and staffing for ambitious teams.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

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

    // Standard meta
    setMeta('description', desc);

    // Canonical
    setCanonical(url);

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
