// Hero image served from /public for LCP discoverability (preloaded in index.html)
const heroBackgroundAsset = '/heroBackground.webp';
const heroBackgroundDarkAsset = '/heroBackground.webp';
import caseStudy from '../assets/services/caseStudies.webp'
import careerOppertunities from '../assets/navItems/careerOppertunities.png'
import aboutUs from '../assets/navItems/aboutUs.png'
import appDev from '../assets/services/appDevelopment.webp'
import webDev from '../assets/services/webDevelopment.webp'
import services from '../assets/navItems/services.webp'
import devOps from '../assets/services/DevOps.webp'
import aiAgentEvalution from '../assets/services/aiAgentEvalution.webp'
import enterpriseAI from '../assets/services/enterpriseAI.webp'
import agentRisk from '../assets/services/agentRisk.webp'
import moniteringTesting from '../assets/services/moniteringTesting.webp'
import rlhf from '../assets/services/rlhf.webp'
import staffing from '../assets/services/staffing.webp'
import blogs from '../assets/services/blogs.webp'
import openings from '../assets/services/openings.webp'
import benefits from '../assets/services/benefits.webp'
import careerGrowth from '../assets/services/careerGrowth.webp'
import whoWeAre from '../assets/services/whoWeAre.webp'
import leadership from '../assets/services/leadership.webp'
import partners from '../assets/services/partners.webp'




export const imagePaths = {
  pageBackground: heroBackgroundAsset,
  heroBackground: heroBackgroundAsset,
  heroBackgroundDark: heroBackgroundDarkAsset,
  navFeatured: {
    services: services,
    insights: caseStudy,
    omio: '',
    careers: careerOppertunities,
    about: aboutUs,
  },
  pageImages: {
    '/services/web-development': webDev,
    '/services/mobile-development': appDev,
    '/services/cloud-devops-custom-integration': devOps,
    '/services/ai-agent-evaluation-benchmarking': aiAgentEvalution,
    '/services/enterprise-ai-agents': enterpriseAI,
    '/services/agent-readiness-risk-assessment': agentRisk,
    '/services/continuous-monitoring-regression-testing': moniteringTesting,
    '/services/sft-rlhf': rlhf,
    '/services/staffing': staffing,
    '/insights/case-studies': caseStudy,
    '/insights/blogs': blogs,
    '/omio-solutions': '',
    '/careers/life-at-omio': '',
    '/careers/open-positions': openings,
    '/careers/benefits': benefits,
    '/careers/professional-development': careerGrowth,
    '/about/who-we-are': whoWeAre,
    '/about/leadership': leadership,
    '/about/partners': partners,
    '/about/location': '',
  },
};
