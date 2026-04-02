import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import HomePage from './pages/HomePage';
import { darkColors, lightColors } from './config/theme';
import { useSite } from './context/SiteContext';
import { routeOrder } from './data/siteContent';

// Lazy-load non-homepage routes to reduce the initial bundle.
const ContentPage = lazy(() => import('./pages/ContentPage'));
const BlogsPage = lazy(() => import('./pages/BlogsPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

// Lazy-load admin routes because they are rarely visited.
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function RouteFallback() {
  return (
    <div className="route-shell" role="status" aria-live="polite" aria-label="Loading page">
      <div className="route-shell__panel">
        <span className="route-shell__eyebrow">Loading</span>
        <div className="route-shell__title" />
        <div className="route-shell__line route-shell__line--wide" />
        <div className="route-shell__line" />
      </div>
    </div>
  );
}

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
      <Route
        path="/admin/login"
        element={(
          <Suspense fallback={<RouteFallback />}>
            <AdminLogin />
          </Suspense>
        )}
      />
      <Route
        path="/admin"
        element={(
          <Suspense fallback={<RouteFallback />}>
            <AdminDashboard />
          </Suspense>
        )}
      />

      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="/insights/blogs"
          element={(
            <Suspense fallback={<RouteFallback />}>
              <BlogsPage />
            </Suspense>
          )}
        />
        <Route
          path="/insights/blogs/:slug"
          element={(
            <Suspense fallback={<RouteFallback />}>
              <BlogPost />
            </Suspense>
          )}
        />
        <Route
          path="/insights/articles/:slug"
          element={(
            <Suspense fallback={<RouteFallback />}>
              <ArticlePage />
            </Suspense>
          )}
        />
        <Route
          path="/contact"
          element={(
            <Suspense fallback={<RouteFallback />}>
              <ContactPage />
            </Suspense>
          )}
        />
        <Route
          path="/about/who-we-are"
          element={(
            <Suspense fallback={<RouteFallback />}>
              <AboutPage />
            </Suspense>
          )}
        />
        {routeOrder.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <ContentPage />
              </Suspense>
            )}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
