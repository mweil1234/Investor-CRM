'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, Contact } from '@/lib/supabase';
import LoginGate from '@/components/LoginGate';
import AddContactModal from '@/components/AddContactModal';
import ContactDetailModal from '@/components/ContactDetailModal';

const PRIORITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  HOT: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  WARM: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  COLD: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
};

const PITCH_COLORS: Record<string, string> = {
  'Pitched previously': '#64748B',
  'Never been pitched': '#10B981',
  'Existing Investor': '#8B5CF6',
};

const STATUS_COLORS: Record<string, string> = {
  'Pitched': '#8B5CF6', 'Partnership in progress': '#10B981', 'Funded': '#059669',
  'Declined': '#EF4444', 'Scheduled Pitch': '#6366F1',
  'Reviewing docs/data room': '#F59E0B', 'Follow up requested': '#EC4899',
};

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterPitch, setFilterPitch] = useState('ALL');
  const [filterDRI, setFilterDRI] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [copied, setCopied] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('crm_auth') === 'true') {
      setAuthed(true);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });
    if (data) setContacts(data.filter(c => c.name?.trim()));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchContacts();
  }, [authed, fetchContacts]);

  const filtered = useMemo(() => {
    let list = contacts.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || [c.name, c.title, c.company, c.email, c.dri, c.notes]
        .some(f => f?.toLowerCase().includes(q));
      const matchPri = filterPriority === 'ALL' || c.priority === filterPriority;
      const matchPitch = filterPitch === 'ALL' || c.pitch_status === filterPitch;
      const matchDRI = filterDRI === 'ALL' || c.dri === filterDRI;
      return matchSearch && matchPri && matchPitch && matchDRI;
    });
    list.sort((a: any, b: any) => {
      let va = a[sortBy] || '', vb = b[sortBy] || '';
      if (sortBy === 'contact_date') { va = va || '0000'; vb = vb || '0000'; }
      const cmp = String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [contacts, search, filterPriority, filterPitch, filterDRI, sortBy, sortDir]);

  const stats = useMemo(() => ({
    total: contacts.length,
    hot: contacts.filter(c => c.priority === 'HOT').length,
    warm: contacts.filter(c => c.priority === 'WARM').length,
    cold: contacts.filter(c => c.priority === 'COLD').length,
    neverPitched: contacts.filter(c => c.pitch_status === 'Never been pitched').length,
    existing: contacts.filter(c => c.pitch_status === 'Existing Investor').length,
  }), [contacts]);

  const dris = useMemo(() =>
    [...new Set(contacts.map(c => c.dri).filter(Boolean))].sort(), [contacts]);

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <span style={{ opacity: 0.2, marginLeft: 4 }}>↕</span>;
    return <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const pillStyle = (active: boolean) => ({
    padding: '6px 14px', borderRadius: 8,
    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent)' : 'var(--surface)',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer' as const,
    transition: 'all 0.15s', whiteSpace: 'nowrap' as const,
  });

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 50%, var(--accent-deep) 100%)',
        padding: '28px 24px 20px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ color: '#fff', margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>
                Biz Development CRM
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: 13 }}>
                Investor Pipeline & Contact Management
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setShowAdd(true)} style={{
                padding: '9px 18px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #fff, #e2e8f0)',
                color: 'var(--accent)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Contact
              </button>
              <button onClick={() => {
                const url = `${window.location.origin}/intake`;
                navigator.clipboard.writeText(url).then(() => {
                  setCopied(true); setTimeout(() => setCopied(false), 2000);
                });
              }} style={{
                padding: '9px 18px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.2)',
                background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
                color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {copied ? '✓ Copied!' : '⤴ Share Intake Form'}
              </button>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['table', 'cards'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{
                    padding: '7px 14px', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: view === v ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: '#fff', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}>{v}</button>
                ))}
              </div>
              <button onClick={() => { sessionStorage.removeItem('crm_auth'); setAuthed(false); }} style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}>Logout</button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginTop: 20 }}>
            {[
              { label: 'Total', value: stats.total, color: '#94a3b8' },
              { label: 'Hot', value: stats.hot, color: '#EF4444' },
              { label: 'Warm', value: stats.warm, color: '#F59E0B' },
              { label: 'Cold', value: stats.cold, color: '#3B82F6' },
              { label: 'Unpitched', value: stats.neverPitched, color: '#10B981' },
              { label: 'Investors', value: stats.existing, color: '#8B5CF6' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{loading ? '—' : s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--border)',
              fontSize: 13, width: 220, outline: 'none', background: 'var(--surface)',
            }} />
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL', 'HOT', 'WARM', 'COLD'].map(p => (
              <button key={p} onClick={() => setFilterPriority(p)} style={pillStyle(filterPriority === p)}>
                {p === 'ALL' ? 'All Priority' : p}
              </button>
            ))}
          </div>
          <select value={filterPitch} onChange={e => setFilterPitch(e.target.value)} style={{
            padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)',
            fontSize: 12, fontWeight: 500, background: 'var(--surface)', cursor: 'pointer',
          }}>
            <option value="ALL">All Pitch Status</option>
            <option value="Pitched previously">Pitched previously</option>
            <option value="Never been pitched">Never been pitched</option>
            <option value="Existing Investor">Existing Investor</option>
          </select>
          <select value={filterDRI} onChange={e => setFilterDRI(e.target.value)} style={{
            padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)',
            fontSize: 12, fontWeight: 500, background: 'var(--surface)', cursor: 'pointer',
          }}>
            <option value="ALL">All DRIs</option>
            {dris.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginLeft: 'auto' }}>
            {filtered.length} contacts
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading contacts...</div>
        ) : view === 'table' ? (
          <div style={{
            background: 'var(--surface)', borderRadius: 12, overflow: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid var(--border)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                  {[
                    { key: 'name', label: 'Name', w: 180 },
                    { key: 'title', label: 'Title', w: 160 },
                    { key: 'company', label: 'Company', w: 150 },
                    { key: 'priority', label: 'Priority', w: 80 },
                    { key: 'pitch_status', label: 'Pitch Status', w: 120 },
                    { key: 'dri', label: 'DRI', w: 110 },
                    { key: 'last_contact', label: 'Last Contact', w: 100 },
                    { key: 'contact_date', label: 'Date', w: 95 },
                    { key: 'email', label: 'Email', w: 180 },
                  ].map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)} style={{
                      padding: '10px 12px', textAlign: 'left', fontWeight: 600,
                      color: 'var(--text-secondary)', fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', minWidth: col.w,
                    }}>{col.label}<SortIcon col={col.key} /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const pc = PRIORITY_COLORS[c.priority];
                  return (
                    <tr key={c.id} onClick={() => setSelected(c)}
                      style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {c.priority && pc ? (
                          <span style={{ background: pc.bg, color: pc.text, padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{c.priority}</span>
                        ) : <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {c.pitch_status ? (
                          <span style={{ color: PITCH_COLORS[c.pitch_status] || '#6B7280', fontSize: 12, fontWeight: 600 }}>{c.pitch_status}</span>
                        ) : <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 12 }}>{c.dri || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 12 }}>{c.last_contact || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 12 }}>{c.contact_date?.split('T')[0] || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#3B82F6', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No contacts match your filters</div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map(c => {
              const pc = PRIORITY_COLORS[c.priority];
              return (
                <div key={c.id} onClick={() => setSelected(c)} className="animate-fade" style={{
                  background: 'var(--surface)', borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
                  border: '1px solid var(--border)', transition: 'all 0.15s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 10,
                        background: pc ? `linear-gradient(135deg, ${pc.dot}33, ${pc.dot}11)` : 'var(--border-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 700, color: pc ? pc.text : 'var(--text-secondary)', flexShrink: 0,
                      }}>
                        {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                        {c.title && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{c.title}</div>}
                        {c.company && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{c.company}</div>}
                      </div>
                    </div>
                    {c.priority && pc && (
                      <span style={{ background: pc.bg, color: pc.text, padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{c.priority}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    {c.dri && <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--border-light)', padding: '2px 8px', borderRadius: 4 }}>{c.dri}</span>}
                    {c.pitch_status && <span style={{ fontSize: 11, color: PITCH_COLORS[c.pitch_status] || '#6B7280', background: `${PITCH_COLORS[c.pitch_status] || '#6B7280'}15`, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{c.pitch_status}</span>}
                    {c.status && <span style={{ fontSize: 11, color: '#fff', background: STATUS_COLORS[c.status] || '#6B7280', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{c.status}</span>}
                  </div>
                  {c.email && <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {selected && (
        <ContactDetailModal
          contact={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => { fetchContacts(); setSelected(null); }}
        />
      )}
      {showAdd && (
        <AddContactModal
          onClose={() => setShowAdd(false)}
          onSaved={fetchContacts}
        />
      )}
    </div>
  );
}
