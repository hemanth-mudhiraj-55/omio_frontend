import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { useSite } from '../context/SiteContext';

function AnimatedAboutStat({ value, suffix = '', label }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return undefined;

    const target = Number(value) || 0;
    const duration = 1200;
    const start = performance.now();
    let frameId = 0;

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(target * eased));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [started, value]);

  return (
    <div ref={ref} className="about-stat">
      <span className="about-stat__number">{`${displayValue}${suffix}`}</span>
      <span className="about-stat__label">{label}</span>
    </div>
  );
}

function AboutPage() {
  const { siteSettings } = useSite();
  const about = siteSettings.aboutPage;
  const aiBot = siteSettings.aiBot;
  const stats = siteSettings.heroStats;

  return (
    <div className="page-stack">
      <SeoHead
        title="Who We Are"
        description="OmiO Software Solutions is a technology startup focused on software development, AI benchmarking, AI agent evaluation, and custom technology solutions."
      />

      <header className="about-hero">
        <p className="section-eyebrow">{about.eyebrow}</p>
        <h1>{about.title}</h1>
        <p className="about-hero__sub">{about.description}</p>
      </header>

      <div className="about-stats">
        {stats.map((stat) => (
          <AnimatedAboutStat
            key={stat.id || stat.label}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
          />
        ))}
      </div>

      <section className="about-section">
        <p className="section-eyebrow">Our mission</p>
        <h2>{about.missionTitle}</h2>
        <p>{about.missionBody}</p>
        <p>{about.missionBody2}</p>
      </section>

      <section className="about-section">
        <p className="section-eyebrow">What we stand for</p>
        <h2>Values that shape every engagement</h2>
        <div className="about-values-grid">
          {about.values.map((value) => (
            <article key={value.title} className="about-value-card">
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <p className="section-eyebrow">How we work</p>
        <h2>{about.workTitle}</h2>
        <p>{about.workBody}</p>
        <p>{about.workBody2}</p>
      </section>

      <section className="about-section">
        <p className="section-eyebrow">Areas of expertise</p>
        <h2>Deep capability where it counts</h2>
        <div className="about-values-grid">
          {about.expertise.map((item) => (
            <article key={item.title} className="about-value-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <p className="section-eyebrow">AI assistant</p>
        <h2>Meet {aiBot.name}</h2>
        <p>{aiBot.summary}</p>
        <div className="about-ocito-card">
          <h3>{aiBot.greeting}</h3>
          <pre className="about-ocito-prompt">{aiBot.systemPrompt}</pre>
        </div>
      </section>

      <section className="about-section about-cta">
        <h2>{about.ctaTitle}</h2>
        <p className="about-cta__text">{about.ctaText}</p>
        <Link className="contact-button" to="/contact">
          Get in touch
        </Link>
      </section>
    </div>
  );
}

export default AboutPage;
