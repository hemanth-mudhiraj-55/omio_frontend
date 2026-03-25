import { useLocation } from 'react-router-dom';
import SectionIntro from '../components/SectionIntro';
import { useSite } from '../context/SiteContext';
import { getLocalizedContent } from '../data/localizedContent';
import { imagePaths } from '../config/imagePaths';

function ContentPage() {
  const { pathname } = useLocation();
  const { language } = useSite();
  const { common, pageContent } = getLocalizedContent(language);
  const page = pageContent[pathname];
  const pageImage = imagePaths.pageImages?.[pathname];

  if (!page) {
    return (
      <div className="page-stack">
        <section className="content-hero">
          <SectionIntro eyebrow="Not Found" title={pathname} intro={common.contentBody} />
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="content-hero">
        <SectionIntro eyebrow={page.eyebrow} title={page.title} intro={page.intro} />
      </section>

      <div className="content-page-visual">
        {pageImage && <img src={pageImage} alt={page.title} />}
      </div>

      {page.body && (
        <section className="content-body-section">
          <p>{page.body}</p>
        </section>
      )}

      {page.details && page.details.length > 0 && (
        <div className="content-details-grid">
          {page.details.map((detail) => (
            <div key={detail.heading} className="content-detail-card">
              <p className="section-eyebrow">{detail.heading}</p>
              <p>{detail.text}</p>
            </div>
          ))}
        </div>
      )}

      {page.highlights && page.highlights.length > 0 && (
        <div className="content-highlights-grid">
          {page.highlights.map((highlight) => (
            <span key={highlight} className="content-highlight-chip">{highlight}</span>
          ))}
        </div>
      )}

    </div>
  );
}

export default ContentPage;
