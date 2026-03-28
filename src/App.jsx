import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import HomePage from './pages/HomePage';

// Lazy-load non-homepage routes to reduce initial bundle
const ContentPage = lazy(() => import('./pages/ContentPage'));
const BlogsPage = lazy(() => import('./pages/BlogsPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
import { darkColors, lightColors } from './config/theme';
import { useSite } from './context/SiteContext';
import { routeOrder } from './data/siteContent';

// Lazy-load admin pages — they are rarely visited and reduce initial bundle
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  const { theme } = useSite();

  useEffect(() => {
    const colors = theme === 'dark' ? darkColors : lightColors;

    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
      document.documentElement.style.setProperty(cssKey, value);
    });

    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <Routes>
      {/* ── Admin (no site chrome, lazy-loaded) ── */}
      <Route path="/admin/login" element={<Suspense fallback={null}><AdminLogin /></Suspense>} />
      <Route path="/admin" element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />

      {/* ── Public site ── */}
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/insights/blogs" element={<Suspense fallback={null}><BlogsPage /></Suspense>} />
        <Route path="/insights/blogs/:slug" element={<Suspense fallback={null}><BlogPost /></Suspense>} />
        <Route path="/insights/articles/:slug" element={<Suspense fallback={null}><ArticlePage /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={null}><ContactPage /></Suspense>} />
        <Route path="/about/who-we-are" element={<Suspense fallback={null}><AboutPage /></Suspense>} />
        {routeOrder.map((route) => (
          <Route key={route.path} path={route.path} element={<Suspense fallback={null}><ContentPage /></Suspense>} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
