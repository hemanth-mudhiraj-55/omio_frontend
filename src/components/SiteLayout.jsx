import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import OcitoChat from './OcitoChat';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function SiteLayout() {
  return (
    <div className="site-shell">
      <ScrollToTop />
      <a className="skip-link" href="#site-main">Skip to content</a>
      <Navbar />
      <main id="site-main" className="site-main" tabIndex="-1">
        <Outlet />
      </main>
      <Footer />
      <OcitoChat />
    </div>
  );
}

export default SiteLayout;
