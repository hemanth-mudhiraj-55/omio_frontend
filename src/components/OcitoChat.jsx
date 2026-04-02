import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import { useSite } from '../context/SiteContext';

/* ── Icon components ────────────────────────── */

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="ocito-message ocito-message--assistant">
      <span className="ocito-typing">
        <span className="ocito-typing__dot" />
        <span className="ocito-typing__dot" />
        <span className="ocito-typing__dot" />
      </span>
    </div>
  );
}

/* ── Constants ──────────────────────────────── */

const SUGGESTED_PROMPTS = [
  'Which OmiO service fits my project?',
  'Tell me about AI agent evaluation',
  'I want to start a project',
  'What career opportunities are open?',
];

const PAGE_NAMES = {
  '/': 'Home',
  '/about': 'About',
  '/services': 'Services',
  '/blogs': 'Blog',
  '/contact': 'Contact',
  '/careers': 'Careers',
};

const LEAD_STEPS = [
  { key: 'projectType', label: 'What type of project?', placeholder: 'e.g. Web app, AI agent, Mobile app, Cloud migration...', type: 'text' },
  { key: 'timeline', label: 'When do you need it?', placeholder: 'e.g. This quarter, 3 months, Flexible...', type: 'text' },
  { key: 'teamSize', label: 'Team size or budget range?', placeholder: 'e.g. 2-3 engineers, $20k-50k, Not sure yet...', type: 'text' },
  { key: 'brief', label: 'Briefly describe your project', placeholder: 'What are you building and what problem does it solve?', type: 'textarea' },
  { key: 'name', label: 'Your name', placeholder: 'Full name', type: 'text', required: true },
  { key: 'email', label: 'Email address', placeholder: 'work@company.com', type: 'email', required: true },
  { key: 'company', label: 'Company (optional)', placeholder: 'Company name', type: 'text' },
];

/* ── Helpers ────────────────────────────────── */

function buildFallbackReply(input) {
  const message = input.toLowerCase();

  if (/(job|career|intern|internship|freelance|role|hiring)/.test(message)) {
    return 'OmiO is always looking for talented engineers and specialists. Send your CV to careers@omio.world.';
  }
  if (/(collaborate|project|hire|service|build|proposal|quote)/.test(message)) {
    return 'OmiO delivers software engineering, AI systems, and cloud infrastructure. For project conversations, reach out to sales@omio.world.';
  }
  if (/(company|about|omio|what do you do)/.test(message)) {
    return 'OmiO Software Solutions builds software products and AI systems with precision and care — covering product engineering, applied AI, cloud infrastructure, and staffing.';
  }
  return 'I can help with OmiO services, careers, and project questions. For specific inquiries, reach the team at hello@omio.world.';
}

function renderFormattedText(text) {
  if (!text) return text;
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>);
    else if (match[3]) parts.push(<code key={match.index} className="ocito-inline-code">{match[3]}</code>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

function formatTimestamp(date) {
  if (!date) return '';
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Build a short conversation summary from chat history for lead storage */
function buildConversationSummary(messages) {
  const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content);
  if (userMessages.length === 0) return '';
  const combined = userMessages.join(' | ');
  return combined.length > 300 ? combined.slice(0, 297) + '...' : combined;
}

/* ── Service Recommendation Card ─────────────── */

function ServiceCard({ service, onStartProject, onNavigate }) {
  return (
    <div className="ocito-service-card">
      <div className="ocito-service-card__header">
        <span className="ocito-service-card__label">Recommended service</span>
      </div>
      <p className="ocito-service-card__name">{service.name}</p>
      <p className="ocito-service-card__desc">{service.description}</p>
      <div className="ocito-service-card__actions">
        <button type="button" className="ocito-service-card__btn ocito-service-card__btn--primary" onClick={() => onNavigate(service.path)}>
          Explore service <ArrowRightIcon />
        </button>
        <button type="button" className="ocito-service-card__btn" onClick={onStartProject}>
          Start a project
        </button>
      </div>
    </div>
  );
}

/* ── Content Suggestion Chips ────────────────── */

function ContentChips({ items, onNavigate }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="ocito-content-chips">
      <span className="ocito-content-chips__label">Related reading</span>
      <div className="ocito-content-chips__list">
        {items.map((item) => (
          <button key={item.path} type="button" className="ocito-content-chip" onClick={() => onNavigate(item.path)}>
            <span className="ocito-content-chip__type">{item.type}</span>
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Quick Action Buttons ────────────────────── */

function QuickActions({ actions, onNavigate, onStartProject }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="ocito-quick-actions">
      {actions.map((action, i) => (
        <button
          key={`${action.label}-${i}`}
          type="button"
          className="ocito-quick-action"
          onClick={() => {
            if (action.action === 'lead-form') onStartProject();
            else if (action.action === 'navigate' && action.path) onNavigate(action.path);
          }}
        >
          {action.label}
          {action.action === 'navigate' && <ArrowRightIcon />}
        </button>
      ))}
    </div>
  );
}

/* ── Lead Qualification Form (stepped) ───────── */

function LeadQualificationForm({ onSubmit, onCancel, submitting, error }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    projectType: '', timeline: '', teamSize: '', brief: '', name: '', email: '', company: '',
  });

  const current = LEAD_STEPS[step];
  const isLast = step === LEAD_STEPS.length - 1;
  const progress = ((step + 1) / LEAD_STEPS.length) * 100;

  const canAdvance = () => {
    const val = data[current.key].trim();
    if (current.required && !val) return false;
    if (current.key === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (isLast) {
      onSubmit(data);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else onCancel();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && current.type !== 'textarea' && canAdvance()) {
      e.preventDefault();
      handleNext(e);
    }
  };

  return (
    <form className="ocito-lead-form" onSubmit={handleNext}>
      <div className="ocito-lead-progress">
        <div className="ocito-lead-progress__bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="ocito-lead-form__step-label">
        {current.label} <span>({step + 1}/{LEAD_STEPS.length})</span>
      </p>
      <div className="ocito-lead-form__field">
        {current.type === 'textarea' ? (
          <textarea
            className="ocito-lead-form__input"
            rows={3}
            placeholder={current.placeholder}
            value={data[current.key]}
            onChange={(e) => setData((d) => ({ ...d, [current.key]: e.target.value }))}
            autoFocus
          />
        ) : (
          <input
            className="ocito-lead-form__input"
            type={current.type}
            placeholder={current.placeholder}
            value={data[current.key]}
            onChange={(e) => setData((d) => ({ ...d, [current.key]: e.target.value }))}
            onKeyDown={handleKeyDown}
            required={current.required}
            autoFocus
          />
        )}
      </div>
      {error && <p className="ocito-lead-form__error">{error}</p>}
      <div className="ocito-lead-form__actions">
        {isLast ? (
          <button className="ocito-lead-form__submit" type="submit" disabled={submitting || !canAdvance()}>
            {submitting ? 'Sending...' : 'Send to OmiO team'}
          </button>
        ) : (
          <button className="ocito-lead-form__submit" type="submit" disabled={!canAdvance()}>
            {data[current.key].trim() ? 'Next' : 'Skip'}
          </button>
        )}
        <button className="ocito-lead-form__cancel" type="button" onClick={handleBack}>
          {step > 0 ? 'Back' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}

/* ── Main Component ─────────────────────────── */

export default function OcitoChat() {
  const { siteSettings, language } = useSite();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const aiBot = siteSettings.aiBot;

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: aiBot.greeting, time: new Date() },
  ]);
  const [leadMode, setLeadMode] = useState(false);
  const [leadStatus, setLeadStatus] = useState('idle');
  const [leadError, setLeadError] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastMeta, setLastMeta] = useState({
    recommendedService: null, suggestedContent: [], intent: null, quickActions: [],
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const panelRef = useRef(null);

  const pageName = PAGE_NAMES[pathname] || pathname.split('/').filter(Boolean).pop() || 'Home';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, lastMeta]);

  useEffect(() => {
    setMessages((current) => {
      if (current.length === 1 && current[0].role === 'assistant') {
        return [{ role: 'assistant', content: aiBot.greeting, time: new Date() }];
      }
      return current;
    });
  }, [aiBot.greeting]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && open) setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') setHasNewMessage(true);
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) setHasNewMessage(false);
  }, [open]);

  const autoResizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, []);

  useEffect(() => {
    autoResizeTextarea();
  }, [message, autoResizeTextarea]);

  const payloadHistory = useMemo(
    () => messages.map((item) => ({ role: item.role, content: item.content })),
    [messages],
  );

  const showPrompts = messages.length === 1 && messages[0].role === 'assistant';

  /* ── Navigation helper ─────────────────────── */

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  const openLeadForm = () => {
    setLeadMode(true);
    setLeadError('');
    setLeadStatus('idle');
  };

  /* ── Process API response metadata ──────────── */

  function processResponseMeta(data) {
    setLastMeta({
      recommendedService: data.recommendedService || null,
      suggestedContent: data.suggestedContent || [],
      intent: data.intent || null,
      quickActions: data.quickActions || [],
    });
  }

  const resetMeta = () => setLastMeta({
    recommendedService: null, suggestedContent: [], intent: null, quickActions: [],
  });

  /* ── Actions ──────────────────────────────── */

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: aiBot.greeting, time: new Date() }]);
    setMessage('');
    setLeadMode(false);
    setLeadError('');
    setLeadStatus('idle');
    resetMeta();
  };

  const sendMessage = async (event) => {
    if (event) event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { role: 'user', content: trimmed, time: new Date() }]);
    setMessage('');
    setLoading(true);
    resetMeta();

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const response = await fetch(`${API_BASE}/api/ocito/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: payloadHistory, page: pathname, language }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to reach Ocito right now.');
      setMessages((current) => [...current, { role: 'assistant', content: data.reply, time: new Date() }]);
      processResponseMeta(data);
    } catch (_error) {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: buildFallbackReply(trimmed), time: new Date() },
      ]);
      resetMeta();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handlePromptClick = (prompt) => {
    if (loading) return;
    setMessage(prompt);
    resetMeta();
    setTimeout(() => {
      setMessages((current) => [...current, { role: 'user', content: prompt, time: new Date() }]);
      setLoading(true);

      fetch(`${API_BASE}/api/ocito/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, history: payloadHistory, page: pathname, language }),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || 'Unable to reach Ocito.');
          setMessages((current) => [...current, { role: 'assistant', content: data.reply, time: new Date() }]);
          processResponseMeta(data);
        })
        .catch(() => {
          setMessages((current) => [
            ...current,
            { role: 'assistant', content: buildFallbackReply(prompt), time: new Date() },
          ]);
        })
        .finally(() => {
          setLoading(false);
          setMessage('');
        });
    }, 0);
  };

  /* ── Lead qualification submit ──────────────── */

  const handleLeadSubmit = async (formData) => {
    const { name, email, company, projectType, timeline, teamSize, brief } = formData;

    if (!name.trim() || !email.trim()) {
      setLeadError('Name and email are required.');
      return;
    }

    setLeadStatus('loading');
    setLeadError('');

    try {
      const leadIntent = lastMeta.intent || 'general';
      const leadService = lastMeta.recommendedService?.name || '';
      const conversationSummary = buildConversationSummary(messages);

      const messageParts = [
        brief.trim() || 'No project description provided',
        projectType.trim() ? `Project type: ${projectType.trim()}` : '',
        timeline.trim() ? `Timeline: ${timeline.trim()}` : '',
        teamSize.trim() ? `Team/Budget: ${teamSize.trim()}` : '',
        company.trim() ? `Company: ${company.trim()}` : '',
        `Intent: ${leadIntent}`,
        leadService ? `Recommended service: ${leadService}` : '',
        `Source page: ${pathname}`,
        conversationSummary ? `Chat summary: ${conversationSummary}` : '',
      ].filter(Boolean).join(' | ');

      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          channel: 'sales',
          subject: `Lead from Ocito${leadService ? ` — ${leadService}` : ''}`,
          message: messageParts,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit. Please try again.');
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: "Your inquiry has been sent to the OmiO team. Expect a response within one business day.",
          time: new Date(),
        },
      ]);
      setLeadMode(false);
      setLeadStatus('idle');
    } catch (error) {
      setLeadError(error.message || 'Something went wrong. Please try again.');
      setLeadStatus('error');
    }
  };

  const cancelLead = () => {
    setLeadMode(false);
    setLeadError('');
    setLeadStatus('idle');
  };

  /* ── Timestamp display logic ──────────────── */

  const shouldShowTimestamp = (index) => {
    if (index === 0) return true;
    const current = messages[index];
    const prev = messages[index - 1];
    if (current.role !== prev.role) return true;
    if (current.time && prev.time) return current.time.getTime() - prev.time.getTime() > 120000;
    return false;
  };

  /* ── Render ───────────────────────────────── */

  const panelClasses = ['ocito-panel', expanded ? 'ocito-panel--expanded' : ''].filter(Boolean).join(' ');
  const isLastMessageAssistant = messages.length > 1 && messages[messages.length - 1].role === 'assistant';

  return (
    <div className={`ocito-shell${open ? ' ocito-shell--open' : ''}`}>
      {open && (
        <section className={panelClasses} ref={panelRef} aria-label="Ocito AI assistant">
          {/* Header */}
          <header className="ocito-panel__header">
            <div className="ocito-header-info">
              <p className="ocito-panel__eyebrow">AI Assistant</p>
              <h2>{aiBot.name}</h2>
              <span className="ocito-context">{pageName}</span>
            </div>
            <div className="ocito-header-actions">
              {!leadMode && (
                <button className="ocito-header-btn" type="button" onClick={openLeadForm} title="Start a project">
                  Start a project
                </button>
              )}
              <button className="ocito-clear-btn" type="button" onClick={clearChat} aria-label="Clear chat" title="Clear chat">
                <ClearIcon />
              </button>
              <button className="ocito-minimize-btn" type="button" onClick={() => setExpanded((v) => !v)} aria-label={expanded ? 'Minimize chat' : 'Expand chat'} title={expanded ? 'Minimize' : 'Expand'}>
                {expanded ? <MinimizeIcon /> : <ExpandIcon />}
              </button>
              <button className="ocito-close" type="button" onClick={() => setOpen(false)} aria-label="Close Ocito chat" title="Close">
                <CloseIcon />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="ocito-messages">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`}>
                {shouldShowTimestamp(index) && item.time && (
                  <div className="ocito-timestamp">{formatTimestamp(item.time)}</div>
                )}
                <div className={`ocito-message ocito-message--${item.role}`}>
                  <span>{item.role === 'assistant' ? renderFormattedText(item.content) : item.content}</span>
                </div>
              </div>
            ))}
            {loading && <TypingIndicator />}

            {/* Service Recommendation Card */}
            {!loading && isLastMessageAssistant && lastMeta.recommendedService && (
              <ServiceCard
                service={lastMeta.recommendedService}
                onStartProject={openLeadForm}
                onNavigate={handleNavigate}
              />
            )}

            {/* Content Suggestions */}
            {!loading && isLastMessageAssistant && lastMeta.suggestedContent.length > 0 && (
              <ContentChips items={lastMeta.suggestedContent} onNavigate={handleNavigate} />
            )}

            {/* Quick Action Buttons */}
            {!loading && isLastMessageAssistant && lastMeta.quickActions.length > 0 && !lastMeta.recommendedService && (
              <QuickActions actions={lastMeta.quickActions} onNavigate={handleNavigate} onStartProject={openLeadForm} />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {showPrompts && !leadMode && (
            <div className="ocito-prompts">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" className="ocito-prompt-chip" onClick={() => handlePromptClick(prompt)} disabled={loading}>
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Lead Qualification Form (stepped) or Chat Input */}
          {leadMode ? (
            <LeadQualificationForm
              onSubmit={handleLeadSubmit}
              onCancel={cancelLead}
              submitting={leadStatus === 'loading'}
              error={leadError}
            />
          ) : (
            <form className="ocito-form" onSubmit={sendMessage}>
              <div className="ocito-input-wrapper">
                <textarea
                  ref={textareaRef}
                  className="ocito-input"
                  rows={1}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about services, careers, or collaboration..."
                  maxLength={2000}
                />
                <button className="ocito-submit" type="submit" disabled={loading || !message.trim()} aria-label="Send message">
                  <SendIcon />
                </button>
              </div>
              <p className="ocito-input-hint">Press Enter to send, Shift+Enter for new line</p>
            </form>
          )}
        </section>
      )}

      {/* Chat Trigger Bubble */}
      <button
        className={`ocito-trigger${hasNewMessage ? ' ocito-trigger--pulse' : ''}`}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="Open Ocito chat"
      >
        <ChatIcon />
        <span>Chat with {aiBot.name}</span>
      </button>
    </div>
  );
}
