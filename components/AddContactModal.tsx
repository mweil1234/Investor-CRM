'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const FIELDS = [
  { key: 'name', label: 'Full Name', required: true, type: 'text' },
  { key: 'title', label: 'Title / Role', required: false, type: 'text' },
  { key: 'company', label: 'Company', required: false, type: 'text' },
  { key: 'email', label: 'Email', required: false, type: 'email' },
  { key: 'phone', label: 'Phone', required: false, type: 'tel' },
  { key: 'priority', label: 'Priority', required: false, type: 'select',
    options: ['', 'HOT', 'WARM', 'COLD'] },
  { key: 'pitch_status', label: 'Pitch Status', required: false, type: 'select',
    options: ['', 'Never been pitched', 'Pitched previously', 'Existing Investor'] },
  { key: 'status', label: 'Status', required: false, type: 'select',
    options: ['', 'Pitched', 'Partnership in progress', 'Funded', 'Declined',
              'Scheduled Pitch', 'Reviewing docs/data room', 'Follow up requested'] },
  { key: 'dri', label: 'DRI (Owner)', required: false, type: 'select',
    options: ['', 'Tony Cho', 'Michael Weil', 'Brendan McKeon'] },
  { key: 'support', label: 'Support', required: false, type: 'text' },
  { key: 'last_contact', label: 'Last Point of Contact', required: false, type: 'select',
    options: ['', 'Email', 'In person', 'Zoom Call', 'Phone call', 'Text/ WhatsApp', 'Sent investor email'] },
  { key: 'contact_date', label: 'Contact Date', required: false, type: 'date' },
  { key: 'source', label: 'Source / Referral', required: false, type: 'text' },
  { key: 'project', label: 'Investment Project', required: false, type: 'text',
    placeholder: 'e.g. PHX JAX' },
  { key: 'notes', label: 'Notes', required: false, type: 'textarea' },
];

type Props = { onClose: () => void; onSaved: () => void };

export default function AddContactModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');

    const payload: any = {};
    FIELDS.forEach(f => {
      const val = form[f.key]?.trim() || '';
      if (f.key === 'contact_date') {
        payload[f.key] = val || null;
      } else {
        payload[f.key] = val;
      }
    });

    const { error: dbErr } = await supabase.from('contacts').insert([payload]);
    if (dbErr) {
      setError(dbErr.message);
      setSaving(false);
    } else {
      onSaved();
      onClose();
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid var(--border)', fontSize: 13, outline: 'none',
    background: 'var(--surface)', color: 'var(--text-primary)',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      }} />
      <div className="animate-slide" style={{
        position: 'relative', background: 'var(--surface)', borderRadius: 16,
        width: '92%', maxWidth: 580, maxHeight: '88vh', overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
          padding: '24px 28px', borderRadius: '16px 16px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 19, fontWeight: 700 }}>Add New Contact</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', fontSize: 12 }}>Fill in the details below</p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18,
          }}>×</button>
        </div>

        {/* Form body */}
        <div style={{ padding: '24px 28px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px 14px' }}>
            {FIELDS.map(f => (
              <div key={f.key} style={{ gridColumn: f.type === 'textarea' ? '1 / -1' : undefined }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5,
                }}>
                  {f.label}{f.required && <span style={{ color: 'var(--hot)' }}> *</span>}
                </label>

                {f.type === 'select' ? (
                  <select value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} style={{
                    ...inputStyle, cursor: 'pointer',
                    color: form[f.key] ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>
                    <option value="">— Select —</option>
                    {f.options?.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder={`Add ${f.label.toLowerCase()}...`}
                  />
                ) : (
                  <input
                    type={f.type} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                    style={inputStyle}
                    placeholder={(f as any).placeholder || `Enter ${f.label.toLowerCase()}`}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="animate-fade" style={{
              color: 'var(--hot)', fontSize: 13, fontWeight: 500, marginTop: 14,
              padding: '8px 12px', background: 'var(--hot-bg)', borderRadius: 8,
            }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10,
          borderTop: '1px solid var(--border-light)',
        }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: 8, border: '1.5px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            opacity: saving ? 0.7 : 1, transition: 'opacity 0.15s',
          }}>{saving ? 'Saving...' : 'Save Contact'}</button>
        </div>
      </div>
    </div>
  );
}
