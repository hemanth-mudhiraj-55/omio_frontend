import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import { defaultSiteSettings } from '../data/defaultSiteSettings';
import '../styles/admin.css';

const STATUS_TABS = ['', 'unread', 'read', 'replied', 'archived'];
const STATUS_LABELS = { '': 'All', unread: 'Unread', read: 'Read', replied: 'Replied', archived: 'Archived' };

const Q_STATUS_TABS = ['', 'pending', 'needs-update', 'needs-followup', 'resolved'];
const Q_STATUS_LABELS = { '': 'All', pending: 'Pending', 'needs-update': 'Needs Update', 'needs-followup': 'Needs Follow-up', resolved: 'Resolved' };
const Q_STATUS_COLORS = { pending: '#e97706', resolved: '#16a34a', 'needs-update': '#dc2626', 'needs-followup': '#7c3aed' };

function formatDate(iso) {
  const date = new Date(`${iso}Z`);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

function normalizeSettings(data) {
  return {
    ...defaultSiteSettings,
    ...data,
    heroStats: Array.isArray(data?.heroStats) ? data.heroStats : defaultSiteSettings.heroStats,
    aboutPage: {
      ...defaultSiteSettings.aboutPage,
      ...(data?.aboutPage || {}),
      values: Array.isArray(data?.aboutPage?.values) ? data.aboutPage.values : defaultSiteSettings.aboutPage.values,
      expertise: Array.isArray(data?.aboutPage?.expertise) ? data.aboutPage.expertise : defaultSiteSettings.aboutPage.expertise,
    },
    aiBot: {
      ...defaultSiteSettings.aiBot,
      ...(data?.aiBot || {}),
    },
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const username = localStorage.getItem('admin_user') || 'admin';

  const [activeView, setActiveView] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings);

  // Ocito question queue state
  const [questions, setQuestions] = useState([]);
  const [qTotal, setQTotal] = useState(0);
  const [qStats, setQStats] = useState(null);
  const [qFilter, setQFilter] = useState('');
  const [selectedQId, setSelectedQId] = useState(null);
  const [qLoading, setQLoading] = useState(true);

  // Knowledge base state
  const [kbEntries, setKbEntries] = useState([]);
  const [kbLoading, setKbLoading] = useState(true);
  const [kbEditing, setKbEditing] = useState(null);
  const [kbForm, setKbForm] = useState({ question: '', answer: '', category: 'general' });
  const [kbSaving, setKbSaving] = useState(false);
  const [kbMessage, setKbMessage] = useState('');

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  const buildAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (channelFilter) params.set('channel', channelFilter);

      const [msgRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/messages?${params}`, { headers: buildAuthHeaders() }),
        fetch(`${API_BASE}/api/admin/stats`, { headers: buildAuthHeaders() }),
      ]);

      if (msgRes.status === 401 || statsRes.status === 401) {
        navigate('/admin/login');
        return;
      }

      const [msgData, statsData] = await Promise.all([msgRes.json(), statsRes.json()]);
      setMessages(msgData.messages || []);
      setTotal(msgData.total || 0);
      setStats(statsData);
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [channelFilter, navigate, statusFilter, token]);

  const fetchSiteSettings = useCallback(async () => {
    if (!token) return;
    setSettingsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/admin/site-settings`, { headers: buildAuthHeaders() });
      if (response.status === 401) {
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      setSiteSettings(normalizeSettings(data));
    } catch (error) {
      console.error('Site settings fetch error:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, [navigate, token]);

  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    setQLoading(true);

    try {
      const params = new URLSearchParams();
      if (qFilter) params.set('status', qFilter);

      const [qRes, qStatsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/ocito-questions?${params}`, { headers: buildAuthHeaders() }),
        fetch(`${API_BASE}/api/admin/ocito-questions/stats`, { headers: buildAuthHeaders() }),
      ]);

      if (qRes.status === 401) {
        navigate('/admin/login');
        return;
      }

      const [qData, qStatsData] = await Promise.all([qRes.json(), qStatsRes.json()]);
      setQuestions(qData.questions || []);
      setQTotal(qData.total || 0);
      setQStats(qStatsData);
    } catch (error) {
      console.error('Ocito questions fetch error:', error);
    } finally {
      setQLoading(false);
    }
  }, [navigate, qFilter, token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    fetchSiteSettings();
  }, [fetchSiteSettings]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const fetchKnowledge = useCallback(async () => {
    if (!token) return;
    setKbLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/knowledge`, { headers: buildAuthHeaders() });
      if (res.status === 401) { navigate('/admin/login'); return; }
      const data = await res.json();
      setKbEntries(data.entries || []);
    } catch (error) {
      console.error('Knowledge fetch error:', error);
    } finally {
      setKbLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  const saveKbEntry = async () => {
    if (!kbForm.question.trim() || !kbForm.answer.trim()) {
      setKbMessage('Question and answer are required.');
      return;
    }
    setKbSaving(true);
    setKbMessage('');
    try {
      const isEdit = kbEditing !== null;
      const url = isEdit ? `${API_BASE}/api/admin/knowledge/${kbEditing}` : `${API_BASE}/api/admin/knowledge`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify(kbForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setKbForm({ question: '', answer: '', category: 'general' });
      setKbEditing(null);
      setKbMessage(isEdit ? 'Entry updated.' : 'Entry added.');
      await fetchKnowledge();
    } catch (error) {
      setKbMessage(error.message);
    } finally {
      setKbSaving(false);
    }
  };

  const toggleKbEnabled = async (entry) => {
    await fetch(`${API_BASE}/api/admin/knowledge/${entry.id}`, {
      method: 'PUT',
      headers: buildAuthHeaders(),
      body: JSON.stringify({ enabled: !entry.enabled }),
    });
    await fetchKnowledge();
  };

  const deleteKbEntry = async (id) => {
    if (!window.confirm('Delete this knowledge entry?')) return;
    await fetch(`${API_BASE}/api/admin/knowledge/${id}`, { method: 'DELETE', headers: buildAuthHeaders() });
    if (kbEditing === id) { setKbEditing(null); setKbForm({ question: '', answer: '', category: 'general' }); }
    await fetchKnowledge();
  };

  const startEditKb = (entry) => {
    setKbEditing(entry.id);
    setKbForm({ question: entry.question, answer: entry.answer, category: entry.category || 'general' });
    setKbMessage('');
  };

  const cancelEditKb = () => {
    setKbEditing(null);
    setKbForm({ question: '', answer: '', category: 'general' });
    setKbMessage('');
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    await fetchMessages();
  };

  const deleteMsg = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    await fetch(`${API_BASE}/api/admin/messages/${id}`, { method: 'DELETE', headers: buildAuthHeaders() });
    setSelectedId(null);
    await fetchMessages();
  };

  const updateQStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/admin/ocito-questions/${id}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    await fetchQuestions();
  };

  const deleteQ = async (id) => {
    if (!window.confirm('Delete this question permanently?')) return;
    await fetch(`${API_BASE}/api/admin/ocito-questions/${id}`, { method: 'DELETE', headers: buildAuthHeaders() });
    setSelectedQId(null);
    await fetchQuestions();
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const updateHeroStat = (index, key, value) => {
    setSiteSettings((current) => ({
      ...current,
      heroStats: current.heroStats.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [key]: key === 'value' ? Number(value) || 0 : value } : item
      )),
    }));
  };

  const updateAboutField = (key, value) => {
    setSiteSettings((current) => ({
      ...current,
      aboutPage: {
        ...current.aboutPage,
        [key]: value,
      },
    }));
  };

  const updateAboutListItem = (listKey, index, key, value) => {
    setSiteSettings((current) => ({
      ...current,
      aboutPage: {
        ...current.aboutPage,
        [listKey]: current.aboutPage[listKey].map((item, itemIndex) => (
          itemIndex === index ? { ...item, [key]: value } : item
        )),
      },
    }));
  };

  const updateAiBotField = (key, value) => {
    setSiteSettings((current) => ({
      ...current,
      aiBot: {
        ...current.aiBot,
        [key]: value,
      },
    }));
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    setSettingsMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/admin/site-settings`, {
        method: 'PUT',
        headers: buildAuthHeaders(),
        body: JSON.stringify(siteSettings),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save site settings');
      }

      setSiteSettings(normalizeSettings(data));
      setSettingsMessage('Site settings saved successfully.');
    } catch (error) {
      setSettingsMessage(error.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const selected = messages.find((message) => message.id === selectedId) || null;
  const channels = stats?.byChannel?.map((channel) => channel.channel) || [];

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div className="admin-topbar__brand">
          <img src="/logo.png" alt="OmiO Software Solutions logo" style={{ width: 28, height: 28 }} />
          OmiO <span>Admin</span>
        </div>
        <div className="admin-topbar__user">
          <button
            className={`admin-view-toggle ${activeView === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveView('messages')}
          >
            Messages
          </button>
          <button
            className={`admin-view-toggle ${activeView === 'content' ? 'active' : ''}`}
            onClick={() => setActiveView('content')}
          >
            Site Content
          </button>
          <button
            className={`admin-view-toggle ${activeView === 'ocito-queue' ? 'active' : ''}`}
            onClick={() => setActiveView('ocito-queue')}
          >
            Ocito Queue
            {qStats && qStats.pending > 0 && (
              <span style={{ marginLeft: 6, background: '#e97706', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
                {qStats.pending}
              </span>
            )}
          </button>
          <button
            className={`admin-view-toggle ${activeView === 'knowledge' ? 'active' : ''}`}
            onClick={() => setActiveView('knowledge')}
          >
            Knowledge Base
          </button>
          <span>{username}</span>
          <button className="admin-btn" onClick={logout}>Sign out</button>
        </div>
      </div>

      <div className="admin-content">
        {activeView === 'messages' && (
          <>
            {stats && (
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <div className="admin-stat-card__label">Total</div>
                  <div className="admin-stat-card__value">{stats.total ?? 0}</div>
                </div>
                <div className="admin-stat-card admin-stat-card--unread">
                  <div className="admin-stat-card__label">Unread</div>
                  <div className="admin-stat-card__value">{stats.unread ?? 0}</div>
                </div>
                <div className="admin-stat-card admin-stat-card--read">
                  <div className="admin-stat-card__label">Read</div>
                  <div className="admin-stat-card__value">{stats.read ?? 0}</div>
                </div>
                <div className="admin-stat-card admin-stat-card--replied">
                  <div className="admin-stat-card__label">Replied</div>
                  <div className="admin-stat-card__value">{stats.replied ?? 0}</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-card__label">Archived</div>
                  <div className="admin-stat-card__value">{stats.archived ?? 0}</div>
                </div>
              </div>
            )}

            <div className="admin-filters">
              {STATUS_TABS.map((status) => (
                <button
                  key={status || 'all'}
                  className={`admin-filter-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => { setStatusFilter(status); setSelectedId(null); }}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
              {channels.length > 0 && (
                <select
                  className="admin-filter-select"
                  value={channelFilter}
                  onChange={(event) => { setChannelFilter(event.target.value); setSelectedId(null); }}
                >
                  <option value="">All channels</option>
                  {channels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </option>
                  ))}
                </select>
              )}
              <span className="admin-filters__count">{total} message{total !== 1 ? 's' : ''}</span>
            </div>

            <div className="admin-split">
              <div className="admin-message-list">
                {loading && <div className="admin-message-list__empty">Loading...</div>}
                {!loading && messages.length === 0 && <div className="admin-message-list__empty">No messages found</div>}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`admin-message-item ${selectedId === message.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(message.id)}
                  >
                    <div className="admin-message-item__row1">
                      <div className="admin-message-item__from">
                        {message.status === 'unread' && <span className="admin-unread-dot" />}
                        {message.name}
                      </div>
                      <span className="admin-message-item__time">{formatDate(message.created_at)}</span>
                    </div>
                    <div className="admin-message-item__row2">
                      <span className="admin-channel-tag">{message.channel}</span>
                      <span className={`admin-status-badge ${message.status}`}>{message.status}</span>
                    </div>
                    <div className="admin-message-item__preview">
                      {message.subject || message.message.slice(0, 72)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-detail">
                {!selected ? (
                  <div className="admin-detail__empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Select a message to read
                  </div>
                ) : (
                  <>
                    <div className="admin-detail__header">
                      <div className="admin-detail__name">
                        {selected.name}
                        <span className={`admin-status-badge ${selected.status}`}>{selected.status}</span>
                      </div>
                      <div className="admin-detail__meta">
                        <span>{selected.email}</span>
                        <span>{selected.channel}</span>
                        <span>{new Date(`${selected.created_at}Z`).toLocaleString()}</span>
                      </div>
                    </div>

                    {selected.subject && <div className="admin-detail__subject">Subject: {selected.subject}</div>}

                    <div className="admin-detail__body">{selected.message}</div>

                    <div className="admin-detail__actions">
                      <a
                        href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Your message to OmiO')}`}
                        className="admin-btn admin-btn--primary"
                      >
                        Reply by email
                      </a>
                      {selected.status !== 'read' && selected.status !== 'replied' && (
                        <button className="admin-btn" onClick={() => updateStatus(selected.id, 'read')}>Mark read</button>
                      )}
                      {selected.status !== 'replied' && (
                        <button className="admin-btn" onClick={() => updateStatus(selected.id, 'replied')}>Mark replied</button>
                      )}
                      {selected.status !== 'archived' && (
                        <button className="admin-btn" onClick={() => updateStatus(selected.id, 'archived')}>Archive</button>
                      )}
                      {selected.status === 'archived' && (
                        <button className="admin-btn" onClick={() => updateStatus(selected.id, 'unread')}>Restore</button>
                      )}
                      <button className="admin-btn admin-btn--danger" onClick={() => deleteMsg(selected.id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {activeView === 'content' && (
          <div className="admin-editor-shell">
            <div className="admin-editor-header">
              <div>
                <p className="admin-editor-eyebrow">Editable website content</p>
                <h2>Homepage, About page, and Ocito settings</h2>
              </div>
              <button className="admin-btn admin-btn--primary" disabled={savingSettings || settingsLoading} onClick={saveSettings}>
                {savingSettings ? 'Saving...' : 'Save changes'}
              </button>
            </div>

            {settingsMessage && <div className="admin-editor-notice">{settingsMessage}</div>}
            {settingsLoading && <div className="admin-editor-panel">Loading site settings...</div>}

            {!settingsLoading && (
              <>
                <section className="admin-editor-panel">
                  <h3>Hero stats</h3>
                  <div className="admin-grid-3">
                    {siteSettings.heroStats.map((item, index) => (
                      <div key={item.id || index} className="admin-card-form">
                        <label>Value</label>
                        <input className="admin-input" type="number" value={item.value} onChange={(event) => updateHeroStat(index, 'value', event.target.value)} />
                        <label>Suffix</label>
                        <input className="admin-input" value={item.suffix || ''} onChange={(event) => updateHeroStat(index, 'suffix', event.target.value)} />
                        <label>Label</label>
                        <input className="admin-input" value={item.label} onChange={(event) => updateHeroStat(index, 'label', event.target.value)} />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="admin-editor-panel">
                  <h3>About page</h3>
                  <div className="admin-editor-grid">
                    {[
                      ['eyebrow', 'Eyebrow'],
                      ['title', 'Hero title'],
                      ['description', 'Hero description'],
                      ['missionTitle', 'Mission title'],
                      ['missionBody', 'Mission body'],
                      ['missionBody2', 'Mission body 2'],
                      ['workTitle', 'Work title'],
                      ['workBody', 'Work body'],
                      ['workBody2', 'Work body 2'],
                      ['ctaTitle', 'CTA title'],
                      ['ctaText', 'CTA text'],
                    ].map(([key, label]) => (
                      <div key={key} className="admin-field">
                        <label>{label}</label>
                        {key.toLowerCase().includes('body') || key.toLowerCase().includes('description') || key.toLowerCase().includes('text') ? (
                          <textarea className="admin-textarea" value={siteSettings.aboutPage[key]} onChange={(event) => updateAboutField(key, event.target.value)} />
                        ) : (
                          <input className="admin-input" value={siteSettings.aboutPage[key]} onChange={(event) => updateAboutField(key, event.target.value)} />
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="admin-editor-panel">
                  <h3>About values</h3>
                  <div className="admin-grid-2">
                    {siteSettings.aboutPage.values.map((item, index) => (
                      <div key={item.title || index} className="admin-card-form">
                        <label>Title</label>
                        <input className="admin-input" value={item.title} onChange={(event) => updateAboutListItem('values', index, 'title', event.target.value)} />
                        <label>Description</label>
                        <textarea className="admin-textarea" value={item.description} onChange={(event) => updateAboutListItem('values', index, 'description', event.target.value)} />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="admin-editor-panel">
                  <h3>About expertise cards</h3>
                  <div className="admin-grid-2">
                    {siteSettings.aboutPage.expertise.map((item, index) => (
                      <div key={item.title || index} className="admin-card-form">
                        <label>Title</label>
                        <input className="admin-input" value={item.title} onChange={(event) => updateAboutListItem('expertise', index, 'title', event.target.value)} />
                        <label>Description</label>
                        <textarea className="admin-textarea" value={item.description} onChange={(event) => updateAboutListItem('expertise', index, 'description', event.target.value)} />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="admin-editor-panel">
                  <h3>Ocito AI bot</h3>
                  <div className="admin-editor-grid">
                    <div className="admin-field">
                      <label>Name</label>
                      <input className="admin-input" value={siteSettings.aiBot.name} onChange={(event) => updateAiBotField('name', event.target.value)} />
                    </div>
                    <div className="admin-field">
                      <label>Greeting</label>
                      <textarea className="admin-textarea" value={siteSettings.aiBot.greeting} onChange={(event) => updateAiBotField('greeting', event.target.value)} />
                    </div>
                    <div className="admin-field admin-field--full">
                      <label>Summary</label>
                      <textarea className="admin-textarea" value={siteSettings.aiBot.summary} onChange={(event) => updateAiBotField('summary', event.target.value)} />
                    </div>
                    <div className="admin-field admin-field--full">
                      <label>System prompt</label>
                      <textarea className="admin-textarea admin-textarea--xl" value={siteSettings.aiBot.systemPrompt} onChange={(event) => updateAiBotField('systemPrompt', event.target.value)} />
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
        {activeView === 'ocito-queue' && (
          <>
            {qStats && (
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <div className="admin-stat-card__label">Total</div>
                  <div className="admin-stat-card__value">{qStats.total ?? 0}</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#e97706' }}>
                  <div className="admin-stat-card__label">Pending</div>
                  <div className="admin-stat-card__value">{qStats.pending ?? 0}</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#dc2626' }}>
                  <div className="admin-stat-card__label">Needs Update</div>
                  <div className="admin-stat-card__value">{qStats['needs-update'] ?? 0}</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#7c3aed' }}>
                  <div className="admin-stat-card__label">Needs Follow-up</div>
                  <div className="admin-stat-card__value">{qStats['needs-followup'] ?? 0}</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#16a34a' }}>
                  <div className="admin-stat-card__label">Resolved</div>
                  <div className="admin-stat-card__value">{qStats.resolved ?? 0}</div>
                </div>
              </div>
            )}

            <div className="admin-filters">
              {Q_STATUS_TABS.map((status) => (
                <button
                  key={status || 'all'}
                  className={`admin-filter-btn ${qFilter === status ? 'active' : ''}`}
                  onClick={() => { setQFilter(status); setSelectedQId(null); }}
                >
                  {Q_STATUS_LABELS[status]}
                </button>
              ))}
              <span className="admin-filters__count">{qTotal} question{qTotal !== 1 ? 's' : ''}</span>
            </div>

            <div className="admin-split">
              <div className="admin-message-list">
                {qLoading && <div className="admin-message-list__empty">Loading...</div>}
                {!qLoading && questions.length === 0 && <div className="admin-message-list__empty">No unanswered questions</div>}
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`admin-message-item ${selectedQId === q.id ? 'selected' : ''}`}
                    onClick={() => setSelectedQId(q.id)}
                  >
                    <div className="admin-message-item__row1">
                      <div className="admin-message-item__from" style={{ flex: 1 }}>
                        {q.status === 'pending' && <span className="admin-unread-dot" />}
                        {q.question.length > 60 ? q.question.slice(0, 60) + '...' : q.question}
                      </div>
                      <span className="admin-message-item__time">{formatDate(q.created_at)}</span>
                    </div>
                    <div className="admin-message-item__row2">
                      <span className="admin-channel-tag">{q.mode}</span>
                      <span className="admin-channel-tag">{q.intent}</span>
                      <span
                        className="admin-status-badge"
                        style={{ background: Q_STATUS_COLORS[q.status] || '#666', color: '#fff' }}
                      >
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-detail">
                {(() => {
                  const selectedQ = questions.find((q) => q.id === selectedQId) || null;
                  if (!selectedQ) {
                    return (
                      <div className="admin-detail__empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Select a question to review
                      </div>
                    );
                  }
                  return (
                    <>
                      <div className="admin-detail__header">
                        <div className="admin-detail__name">
                          Unanswered Question
                          <span
                            className="admin-status-badge"
                            style={{ background: Q_STATUS_COLORS[selectedQ.status] || '#666', color: '#fff' }}
                          >
                            {selectedQ.status}
                          </span>
                        </div>
                        <div className="admin-detail__meta">
                          <span>Page: {selectedQ.page}</span>
                          <span>Lang: {selectedQ.language}</span>
                          <span>Intent: {selectedQ.intent}</span>
                          <span>Lead: {selectedQ.leadLabel}</span>
                          <span>Mode: {selectedQ.mode}</span>
                          <span>{new Date(`${selectedQ.created_at}Z`).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="admin-detail__subject" style={{ fontWeight: 600 }}>
                        Question: {selectedQ.question}
                      </div>

                      {selectedQ.reply && (
                        <div className="admin-detail__body" style={{ opacity: 0.8 }}>
                          <strong>Fallback reply given:</strong><br />
                          {selectedQ.reply}
                        </div>
                      )}

                      <div className="admin-detail__actions">
                        {selectedQ.status !== 'resolved' && (
                          <button className="admin-btn admin-btn--primary" onClick={() => updateQStatus(selectedQ.id, 'resolved')}>
                            Mark resolved
                          </button>
                        )}
                        {selectedQ.status !== 'needs-update' && (
                          <button className="admin-btn" onClick={() => updateQStatus(selectedQ.id, 'needs-update')}>
                            Needs knowledge update
                          </button>
                        )}
                        {selectedQ.status !== 'needs-followup' && (
                          <button className="admin-btn" onClick={() => updateQStatus(selectedQ.id, 'needs-followup')}>
                            Needs human follow-up
                          </button>
                        )}
                        {selectedQ.status === 'resolved' && (
                          <button className="admin-btn" onClick={() => updateQStatus(selectedQ.id, 'pending')}>
                            Reopen
                          </button>
                        )}
                        <button className="admin-btn admin-btn--danger" onClick={() => deleteQ(selectedQ.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {activeView === 'knowledge' && (
          <div className="admin-editor-shell">
            <div className="admin-editor-header">
              <div>
                <p className="admin-editor-eyebrow">Ocito AI knowledge base</p>
                <h2>Custom Q&amp;A entries injected into Ocito&apos;s system prompt</h2>
              </div>
            </div>

            {kbMessage && <div className="admin-editor-notice">{kbMessage}</div>}

            <section className="admin-editor-panel">
              <h3>{kbEditing !== null ? 'Edit entry' : 'Add new entry'}</h3>
              <div className="admin-editor-grid">
                <div className="admin-field">
                  <label>Category</label>
                  <input
                    className="admin-input"
                    value={kbForm.category}
                    onChange={(e) => setKbForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="e.g. general, pricing, technical"
                  />
                </div>
                <div className="admin-field admin-field--full">
                  <label>Question</label>
                  <input
                    className="admin-input"
                    value={kbForm.question}
                    onChange={(e) => setKbForm((f) => ({ ...f, question: e.target.value }))}
                    placeholder="What question should Ocito know how to answer?"
                    maxLength={500}
                  />
                </div>
                <div className="admin-field admin-field--full">
                  <label>Answer</label>
                  <textarea
                    className="admin-textarea"
                    value={kbForm.answer}
                    onChange={(e) => setKbForm((f) => ({ ...f, answer: e.target.value }))}
                    placeholder="The answer Ocito should give..."
                    maxLength={2000}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="admin-btn admin-btn--primary" disabled={kbSaving} onClick={saveKbEntry}>
                  {kbSaving ? 'Saving...' : kbEditing !== null ? 'Update entry' : 'Add entry'}
                </button>
                {kbEditing !== null && (
                  <button className="admin-btn" onClick={cancelEditKb}>Cancel</button>
                )}
              </div>
            </section>

            <section className="admin-editor-panel">
              <h3>Entries ({kbEntries.length})</h3>
              {kbLoading && <p>Loading...</p>}
              {!kbLoading && kbEntries.length === 0 && <p style={{ color: 'var(--text-subtle)' }}>No knowledge entries yet. Add one above.</p>}
              {kbEntries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '14px 16px',
                    marginBottom: 8,
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: entry.enabled ? 'var(--surface)' : 'var(--page-background)',
                    opacity: entry.enabled ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.04em', padding: '2px 8px', borderRadius: 4,
                          background: 'var(--accent-soft)', color: 'var(--accent)',
                        }}>
                          {entry.category}
                        </span>
                        {!entry.enabled && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#dc2626' }}>Disabled</span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.88rem' }}>{entry.question}</p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-subtle)', whiteSpace: 'pre-wrap' }}>{entry.answer}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="admin-btn" onClick={() => toggleKbEnabled(entry)}>
                        {entry.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button className="admin-btn" onClick={() => startEditKb(entry)}>Edit</button>
                      <button className="admin-btn admin-btn--danger" onClick={() => deleteKbEntry(entry.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
