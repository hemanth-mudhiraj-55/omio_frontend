import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import '../styles/admin.css';

const STATUS_TABS = ['', 'unread', 'read', 'replied', 'archived'];
const STATUS_LABELS = { '': 'All', unread: 'Unread', read: 'Read', replied: 'Replied', archived: 'Archived' };

function formatDate(iso) {
  const d = new Date(iso + 'Z'); // treat as UTC
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const username = localStorage.getItem('admin_user') || 'admin';

  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (channelFilter) params.set('channel', channelFilter);

      const [msgRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/messages?${params}`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/stats`, { headers: authHeaders }),
      ]);

      if (msgRes.status === 401) { navigate('/admin/login'); return; }

      const [msgData, statsData] = await Promise.all([msgRes.json(), statsRes.json()]);
      setMessages(msgData.messages || []);
      setTotal(msgData.total || 0);
      setStats(statsData);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, channelFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status }),
    });
    await fetchData();
  };

  const deleteMsg = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    await fetch(`${API_BASE}/api/admin/messages/${id}`, { method: 'DELETE', headers: authHeaders });
    setSelectedId(null);
    await fetchData();
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const selected = messages.find(m => m.id === selectedId) || null;
  const channels = stats?.byChannel?.map(c => c.channel) || [];

  return (
    <div className="admin-shell">
      {/* ── Topbar ── */}
      <div className="admin-topbar">
        <div className="admin-topbar__brand">
          <img src="/logo.png" alt="OmiO Software Solutions logo" style={{ width: 28, height: 28 }} />
          OmiO <span>Admin</span>
        </div>
        <div className="admin-topbar__user">
          <span>{username}</span>
          <button className="admin-btn" onClick={logout}>Sign out</button>
        </div>
      </div>

      <div className="admin-content">
        {/* ── Stats ── */}
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

        {/* ── Filters ── */}
        <div className="admin-filters">
          {STATUS_TABS.map(s => (
            <button
              key={s || 'all'}
              className={`admin-filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatusFilter(s); setSelectedId(null); }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          {channels.length > 0 && (
            <select
              className="admin-filter-select"
              value={channelFilter}
              onChange={e => { setChannelFilter(e.target.value); setSelectedId(null); }}
            >
              <option value="">All channels</option>
              {channels.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          )}
          <span className="admin-filters__count">{total} message{total !== 1 ? 's' : ''}</span>
        </div>

        {/* ── Split panel ── */}
        <div className="admin-split">
          {/* Message list */}
          <div className="admin-message-list">
            {loading && (
              <div className="admin-message-list__empty">Loading…</div>
            )}
            {!loading && messages.length === 0 && (
              <div className="admin-message-list__empty">No messages found</div>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`admin-message-item ${selectedId === msg.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(msg.id)}
              >
                <div className="admin-message-item__row1">
                  <div className="admin-message-item__from">
                    {msg.status === 'unread' && <span className="admin-unread-dot" />}
                    {msg.name}
                  </div>
                  <span className="admin-message-item__time">{formatDate(msg.created_at)}</span>
                </div>
                <div className="admin-message-item__row2">
                  <span className="admin-channel-tag">{msg.channel}</span>
                  <span className={`admin-status-badge ${msg.status}`}>{msg.status}</span>
                </div>
                <div className="admin-message-item__preview">
                  {msg.subject || msg.message.slice(0, 72)}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="admin-detail">
            {!selected ? (
              <div className="admin-detail__empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
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
                    <span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      {selected.email}
                    </span>
                    <span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      {selected.channel}
                    </span>
                    <span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {new Date(selected.created_at + 'Z').toLocaleString()}
                    </span>
                  </div>
                </div>

                {selected.subject && (
                  <div className="admin-detail__subject">
                    Subject: {selected.subject}
                  </div>
                )}

                <div className="admin-detail__body">{selected.message}</div>

                <div className="admin-detail__actions">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Your message to OmiO')}`}
                    className="admin-btn admin-btn--primary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
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
      </div>
    </div>
  );
}
