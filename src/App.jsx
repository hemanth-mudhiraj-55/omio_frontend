import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import HomePage from './pages/HomePage';
import ContentPage from './pages/ContentPage';
import BlogsPage from './pages/BlogsPage';
import BlogPost from './pages/BlogPost';
import ArticlePage from './pages/ArticlePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
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
        <Route path="/insights/blogs" element={<BlogsPage />} />
        <Route path="/insights/blogs/:slug" element={<BlogPost />} />
        <Route path="/insights/articles/:slug" element={<ArticlePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about/who-we-are" element={<AboutPage />} />
        {routeOrder.map((route) => (
          <Route key={route.path} path={route.path} element={<ContentPage />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
