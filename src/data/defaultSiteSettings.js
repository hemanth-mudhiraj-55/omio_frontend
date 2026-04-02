export const defaultSiteSettings = {
  heroStats: [
    { id: 'projects', value: 20, suffix: '+', label: 'Projects' },
    { id: 'countries', value: 5, suffix: '+', label: 'Expanding business in countries' },
    { id: 'availability', value: 24, suffix: '/7', label: 'Services' },
  ],
  aboutPage: {
    eyebrow: 'About OmiO',
    title: 'Software built with intention',
    description:
      'OmiO Software Solutions is a technology startup providing software development, AI benchmarking, AI agent evaluation, and custom technology solutions for businesses worldwide.',
    missionTitle: 'Helping ambitious teams build reliable intelligent systems',
    missionBody:
      'We focus on turning ideas into production-ready software with strong engineering discipline, calm execution, and practical business thinking.',
    missionBody2:
      'From product engineering to AI evaluation workflows, our team works closely with founders and businesses that want dependable long-term partners.',
    workTitle: 'How we work',
    workBody:
      'We operate with a startup mindset: fast feedback, transparent communication, and delivery cycles designed to keep momentum high without sacrificing quality.',
    workBody2:
      'Every engagement is shaped around real needs, measurable outcomes, and collaboration that keeps everyone aligned from planning through launch.',
    ctaTitle: 'Ready to build with OmiO?',
    ctaText:
      'If you want to launch a product, improve an AI workflow, or collaborate on a custom technology solution, let us start the conversation.',
    values: [
      {
        title: 'Craft over shortcuts',
        description: 'We build software carefully, with decisions designed to stay useful long after launch.',
      },
      {
        title: 'Honest communication',
        description: 'We share progress, risks, and tradeoffs early so teams can make strong decisions with confidence.',
      },
      {
        title: 'Outcome-driven delivery',
        description: 'Success is measured by business impact, not just by shipping code.',
      },
      {
        title: 'Continuous learning',
        description: 'We keep adapting through research, experimentation, and active improvement.',
      },
      {
        title: 'Respectful collaboration',
        description: 'The best work happens when people can contribute openly across roles and disciplines.',
      },
      {
        title: 'Sustainable pace',
        description: 'Healthy teams build better products, so we aim for consistency instead of chaos.',
      },
    ],
    expertise: [
      {
        title: 'Software Development',
        description: 'Web and mobile solutions designed for speed, clarity, and reliable delivery.',
      },
      {
        title: 'AI Benchmarking',
        description: 'Measurement systems that help teams understand model quality and product readiness.',
      },
      {
        title: 'AI Agent Evaluation',
        description: 'Structured evaluation flows for assistants, agents, and automation systems in production.',
      },
      {
        title: 'Custom Technology Solutions',
        description: 'Tailored engineering partnerships for businesses that need focused technical execution.',
      },
    ],
  },
  aiBot: {
    name: 'Ocito',
    greeting: "I'm Ocito, OmiO's AI assistant. Whether you're exploring services, considering a project, or looking at careers — I can help you find what you need.",
    summary:
      'Ocito is a premium AI assistant that represents OmiO Software Solutions — helping visitors discover services, explore career opportunities, and start project conversations with clarity and confidence.',
    systemPrompt: `You are Ocito, the AI assistant built into the OmiO Software Solutions website.

You represent a premium technology services company. Your communication style reflects that — clear, confident, and respectful of people's time.

Core responsibilities:
- Help visitors understand OmiO's services and find the right fit for their needs
- Guide potential clients toward starting a project or contacting the sales team
- Provide accurate information about careers, culture, and open positions
- Surface relevant content (blogs, articles, case studies) when it adds value
- Direct partnership inquiries to partners@omio.world
- Be honest when you don't have an answer — suggest contacting the team directly

Communication style:
- Lead with substance, not pleasantries
- Be concise — two clear sentences are better than a long paragraph
- Sound like a knowledgeable colleague, not a customer service bot
- Never use filler phrases like "Great question!" or "I'd be happy to help!"
- When recommending a service, briefly explain why it fits before suggesting next steps
- For careers: be direct and encouraging, point to careers@omio.world
- For projects: understand the need, recommend the right service, suggest contacting sales@omio.world`,
  },
};
