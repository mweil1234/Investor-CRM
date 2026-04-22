'use client';
import { useState } from 'react';
import { supabase, Contact } from '@/lib/supabase';

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  HOT: { bg: '#FEE2E2', text: '#991B1B' },
  WARM: { bg: '#FEF3C7', text: '#92400E' },
  COLD: { bg: '#DBEAFE', text: '#1E40AF' },
};

const STATUS_COLORS: Record<string, string> = {
  'Pitched': '#8B5CF6',
  'Partnership in progress': '#10B981',
  'Funded': '#059669',
  'Declined': '#EF4444',
  'Scheduled Pitch': '#6366F1',
  'Reviewing docs/data room': '#F59E0B',
  'Follow up requested': '#EC4899',
};

const PITCH_COLORS: Record<string, string> = {
  'Pitched previously': '#64748B',
  'Never been pitched': '#10B981',
  'Existing Investor': '#8B5CF6',
};

function formatPhone(ph: string) {
  if (!ph || ph.length < 10) return ph;
  const d = ph.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `+1 (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return ph;
}

type Props = { contact: Contact; onClose: () => void; onUpdated: () => void };

export default function ContactDetailModal({ contact, onClose, onUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...contact });
  const [saving, setSaving] = useState(false);

  const pc = PRIORITY_COLORS[contact.priority];
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('contacts').update({
      name: form.name, title: form.title, company: form.company,
      dri: form.dri, support: form.support, status: form.status,
      priority: form.priority, last_contact: form.last_contact,
      contact_date: form.contact_date || null, source: form.source,
      project: form.project, notes: form.notes, phone: form.phone,
      email: form.email, pitch_status: form.pitch_status,
    }).eq('id', contact.id);
    setSaving(false);
    if (!error) { setEditing(false); onUpdated(); }
  };

  const editSelectStyle = {
    padding: '6px 8px', borderRadius: 6, border: '1.5px solid var(--border)',
    fontSize: 13, background: 'var(--surface)', width: '100%', outline: 'none',
  };
  const editInputStyle = {
    ...editSelectStyle, color: 'var(--text-primary)',
  };

  const fields = [
    { label: 'Email', value: contact.email, key: 'email', icon: '✉', type: 'email' },
    { label: 'Phone', value: formatPhone(contact.phone), key: 'phone', icon: '☎', type: 'tel' },
    { label: 'DRI', value: contact.dri, key: 'dri', icon: '◉', type: 'select',
      options: ['', 'Tony Cho', 'Michael Weil', 'Brendan McKeon'] },
    { label: 'Support', value: contact.support, key: 'support', icon: '◎', type: 'text' },
    { label: 'Priority', value: contact.priority, key: 'priority', icon: '⬥', type: 'select',
      options: ['', 'HOT', 'WARM', 'COLD'] },
    { label: 'Status', value: contact.status, key: 'status', icon: '◆', type: 'select',
      options: ['', 'Pitched', 'Partnership in progress', 'Funded', 'Declined',
                'Scheduled Pitch', 'Reviewing docs/data room', 'Follow up requested'] },
    { label: 'Pitch Status', value: contact.pitch_status, key: 'pitch_status', icon: '▶', type: 'select',
      options: ['', 'Pitched previously', 'Never been pitched', 'Existing Investor'] },
    { label: 'Last Contact', value: contact.last_contact, key: 'last_contact', icon: '◷', type: 'select',
      options: ['', 'Email', 'In person', 'Zoom Call', 'Phone call', 'Text/ WhatsApp', 'Sent investor email'] },
    { label: 'Contact Date', value: contact.contact_date?.split('T')[0] || '', key: 'contact_date', icon: '📅', type: 'date' },
    { label: 'Source', value: contact.source, key: 'source', icon: '⊕', type: 'text' },
    { label: 'Project', value: contact.project, key: 'project', icon: '▣', type: 'text' },
    { label: 'Notes', value: contact.notes, key: 'notes', icon: '☰', type: 'textarea' },
  ].filter(f => editing || f.value);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
      <div className="animate-slide" style={{
        position: 'relative', background: 'var(--surface)', borderRadius: 16,
        width: '92%', maxWidth: 560, maxHeight: '88vh', overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
          padding: '32px 28px 24px', borderRadius: '16px 16px 0 0', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18,
          }}>×</button>

          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 14,
          }}>
            {contact.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>

          {editing ? (
            <input value={form.name} onChange={e => set('name', e.target.value)} style={{
              ...editInputStyle, background: 'rgba(255,255,255,0.12)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)', fontSize: 20, fontWeight: 700,
            }} />
          ) : (
            <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 700 }}>{contact.name}</h2>
          )}

          {editing ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Title" style={{
                ...editInputStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.15)', fontSize: 13, flex: 1,
              }} />
              <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company" style={{
                ...editInputStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.15)', fontSize: 13, flex: 1,
              }} />
            </div>
          ) : (
            <>
              {contact.title && <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 14 }}>{contact.title}</p>}
              {contact.company && <p style={{ color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', fontSize: 13 }}>{contact.company}</p>}
            </>
          )}

          {!editing && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {contact.priority && pc && (
                <span style={{ background: pc.bg, color: pc.text, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{contact.priority}</span>
              )}
              {contact.status && (
                <span style={{ background: STATUS_COLORS[contact.status] || '#6B7280', color: '#fff', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{contact.status}</span>
              )}
              {contact.pitch_status && (
                <span style={{ background: PITCH_COLORS[contact.pitch_status] || '#6B7280', color: '#fff', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{contact.pitch_status}</span>
              )}
            </div>
          )}
        </div>

        {/* Fields */}
        <div style={{ padding: '24px 28px' }}>
          {fields.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ width: 20, textAlign: 'center', fontSize: 14, opacity: 0.4, marginTop: 2 }}>{f.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>{f.label}</div>
                {editing ? (
                  f.type === 'select' ? (
                    <select value={(form as any)[f.key] || ''} onChange={e => set(f.key, e.target.value)} style={editSelectStyle}>
                      <option value="">— None —</option>
                      {f.options?.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea value={(form as any)[f.key] || ''} onChange={e => set(f.key, e.target.value)} rows={3} style={{ ...editInputStyle, resize: 'vertical' }} />
                  ) : (
                    <input type={f.type || 'text'} value={(form as any)[f.key] || ''} onChange={e => set(f.key, e.target.value)} style={editInputStyle} />
                  )
                ) : (
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{f.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div style={{
          padding: '16px 28px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10,
          borderTop: '1px solid var(--border-light)',
        }}>
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setForm({ ...contact }); }} style={{
                padding: '10px 20px', borderRadius: 8, border: '1.5px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>Edit Contact</button>
          )}
        </div>
      </div>
    </div>
  );
}
