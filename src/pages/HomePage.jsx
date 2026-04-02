import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { imagePaths } from '../config/imagePaths';
import { useSite } from '../context/SiteContext';
import { getLocalizedContent } from '../data/localizedContent';

function AnimatedCounter({ value, suffix = '', label }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return undefined;

    const target = Number(value) || 0;
    const duration = 1200;
    const start = performance.now();
    let frameId = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(target * eased));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [hasStarted, value]);

  return (
    <div ref={ref} className="hero-stat">
      <strong>{`${displayValue}${suffix}`}</strong>
      <span>{label}</span>
    </div>
  );
}

function RevealOnScroll({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function HomePage() {
  const { language, siteSettings } = useSite();
  const {
    heroContent,
    homeHighlights,
    homePillars,
    labels,
    navigationGroups,
  } = getLocalizedContent(language);

  const servicesPreview = navigationGroups.find((group) => group.key === 'services')?.items.slice(0, 6) ?? [];
  const insightPreview = navigationGroups.find((group) => group.key === 'insights')?.items ?? [];
  const aboutPreview = navigationGroups.find((group) => group.key === 'about')?.items.slice(0, 3) ?? [];
  const heroStats = useMemo(
    () => (Array.isArray(siteSettings.heroStats) ? siteSettings.heroStats : []).slice(0, 3),
    [siteSettings.heroStats],
  );

  return (
    <div className="page-stack">
      <SeoHead
        description="OmiO Software Solutions - enterprise-grade software services, AI agent evaluation, cloud DevOps, and proven case studies from real delivery."
      />

      {/* ─── Hero ─── */}
      <section className="hero-section">
        {imagePaths.heroBackground && (
          <img
            className="hero-bg"
            src={imagePaths.heroBackground}
            alt="OmiO Software Solutions - enterprise software development and AI services"
            fetchPriority="high"
          />
        )}
        <div className="hero-overlay" />
        <div className="hero-panel">
          <div className="hero-copy">
            <p className="hero-eyebrow">{heroContent.eyebrow}</p>
            <h1 className="hero-title">
              {heroContent.titleLines.map((line) => (
                <span key={line.text} className={`hero-line hero-line--${line.tone}`}>
                  {line.text}
                </span>
              ))}
            </h1>
            <p className="hero-description">{heroContent.description}</p>
          </div>
          <div className="hero-stats">
            {heroStats.map((item) => (
              <AnimatedCounter
                key={item.id || item.label}
                value={item.value}
                suffix={item.suffix}
                label={item.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Intro band ─── */}
      <RevealOnScroll>
        <section className="home-intro-band">
          <div className="intro-rule" />
          <h2>Enterprise-Grade Software Services</h2>
          <p>
            OmiO delivers enterprise-grade software services across web development,
            mobile engineering, cloud DevOps, and applied AI. Our delivery approach is shaped by
            real case studies and proven outcomes — helping ambitious teams build intelligent systems
            with precision and long-term reliability.
          </p>
        </section>
      </RevealOnScroll>

      {/* ─── Pillars ─── */}
      <section className="pillar-grid">
        {homePillars.map((pillar, i) => (
          <RevealOnScroll key={pillar.title} delay={i * 100}>
            <article className="pillar-card">
              <span className="pillar-number">0{i + 1}</span>
              <p className="pillar-eyebrow">{pillar.eyebrow}</p>
              <h2>{pillar.title}</h2>
              <p>{pillar.description}</p>
            </article>
          </RevealOnScroll>
        ))}
      </section>

      {/* ─── Services ─── */}
      <RevealOnScroll>
        <section className="services-preview">
          <div className="section-header">
            <p className="section-label">{labels.servicesHeading}</p>
            <h2 className="section-title">{labels.servicesSubheading}</h2>
          </div>
          <div className="services-grid">
            {servicesPreview.map((service, i) => (
              <Link key={service.path} className="service-card" to={service.path}>
                <div className="service-card-head">
                  <span className="service-num">0{i + 1}</span>
                  <h3>{service.title}</h3>
                </div>
                <p>{service.description}</p>
                <span className="service-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      {/* ─── Story / Why OmiO ─── */}
      <section className="story-section">
        <RevealOnScroll>
          <article className="story-panel story-panel--copy">
            <p className="section-label">{labels.whyOmiO}</p>
            <h2 className="story-headline">{labels.whyOmiOTitle}</h2>
            <p className="story-body">{labels.whyOmiOBody}</p>
            <div className="story-links">
              <Link className="btn-text" to="/insights/case-studies">
                {labels.viewCaseStudies} &rarr;
              </Link>
              <Link className="btn-text" to="/about/who-we-are">
                {labels.aboutOmiO} &rarr;
              </Link>
            </div>
          </article>
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <article className="story-panel story-panel--feature">
            <p className="section-label">{labels.siteReadiness}</p>
            <div className="story-feature-shell">
              {homeHighlights.map((item) => (
                <div key={item.title} className="story-feature-row">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </article>
        </RevealOnScroll>
      </section>

      {/* ─── Insights ─── */}
      <RevealOnScroll>
        <section className="insight-section">
          <div className="section-header">
            <p className="section-label">{labels.insightsHeading}</p>
            <h2 className="section-title">{labels.insightsTitle}</h2>
          </div>
          <div className="insight-grid">
            {insightPreview.map((item, index) => (
              <Link key={item.path} className="insight-card" to={item.path}>
                <div className="insight-card-top">
                  <span className="insight-kicker">0{index + 1}</span>
                  <span className="insight-chip">{item.title}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="insight-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      {/* ─── About ─── */}
      <RevealOnScroll>
        <section className="about-band">
          <div className="section-header">
            <p className="section-label">{labels.aboutHeading}</p>
            <h2 className="section-title">{labels.aboutTitle}</h2>
          </div>
          <div className="about-band-links">
            {aboutPreview.map((item) => (
              <Link key={item.path} className="about-band-link" to={item.path}>
                <span>{item.title}</span>
                <small>{item.description}</small>
                <span className="about-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      </RevealOnScroll>
    </div>
  );
}

export default HomePage;
