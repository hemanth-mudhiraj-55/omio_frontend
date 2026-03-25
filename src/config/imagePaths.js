import heroBackgroundAsset from '../assets/heroBackground.png';
import heroBackgroundDarkAsset from '../assets/heroBackgroundDark.svg';
import caseStudy from '../assets/caseStudyBackground.png'
import careerOppertunities from '../assets/careerOppertunities.png'
import aboutUs from '../assets/aboutUs.png'

export const imagePaths = {
  pageBackground: heroBackgroundAsset,
  heroBackground: heroBackgroundAsset,
  heroBackgroundDark: heroBackgroundDarkAsset,
  navFeatured: {
    services: '',
    insights: caseStudy,
    omio: '',
    careers: careerOppertunities,
    about: aboutUs,
  },
  pageImages: {
    '/services/web-development': '',
    '/services/mobile-development': '',
    '/services/cloud-devops-custom-integration': '',
    '/services/ai-agent-evaluation-benchmarking': '',
    '/services/enterprise-ai-agents': '',
    '/services/agent-readiness-risk-assessment': '',
    '/services/continuous-monitoring-regression-testing': '',
    '/services/sft-rlhf': '',
    '/services/staffing': '',
    '/insights/case-studies': '',
    '/insights/blogs': '',
    '/omio-solutions': '',
    '/careers/life-at-omio': '',
    '/careers/open-positions': '',
    '/careers/benefits': '',
    '/careers/professional-development': '',
    '/about/who-we-are': '',
    '/about/leadership': '',
    '/about/partners': '',
    '/about/location': '',
  },
};
