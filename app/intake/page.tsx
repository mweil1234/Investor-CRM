'use client';
import { useState } from 'react';

const FIELDS = [
  { key: 'name', label: 'Full Name', required: true, type: 'text', half: false },
  { key: 'title', label: 'Title / Role', required: false, type: 'text', half: true },
  { key: 'company', label: 'Company', required: false, type: 'text', half: true },
  { key: 'email', label: 'Email Address', required: false, type: 'email', half: true },
  { key: 'phone', label: 'Phone Number', required: false, type: 'tel', half: true },
  { key: 'priority', label: 'Priority Level', required: false, type: 'select', half: true,
    options: ['', 'HOT', 'WARM', 'COLD'] },
  { key: 'dri', label: 'Referred to (DRI)', required: false, type: 'select', half: true,
    options: ['', 'Tony Cho', 'Michael Weil', 'Brendan McKeon'] },
  { key: 'source', label: 'How did you hear about us / Referral', required: false, type: 'text', half: false },
  { key: 'project', label: 'Investment Project', required: false, type: 'text', half: true,
    placeholder: 'e.g. PHX JAX' },
  { key: 'pitch_status', label: 'Pitch Status', required: false, type: 'select', half: true,
    options: ['', 'Never been pitched', 'Pitched previously', 'Existing Investor'] },
  { key: 'notes', label: 'Additional Notes', required: false, type: 'textarea', half: false },
];

export default function IntakePage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) { setError('Name is required'); return; }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
    background: '#fff', color: '#1e293b', transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f0fdf4 0%, #f8fafc 40%, #eff6ff 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '56px 40px', maxWidth: 480,
          textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#fff',
          }}>✓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: '0 0 8px',
            fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            Contact Submitted
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
            Thank you! <strong>{form.name}</strong> has been added to the CRM pipeline.
            The team will be notified.
          </p>
          <button onClick={() => { setForm({}); setSubmitted(false); }} style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>Submit Another Contact</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #eff6ff 0%, #f8fafc 40%, #faf5ff 100%)',
      padding: '40px 20px 60px',
      fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
    }}>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.5,
          }}>BD</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: '0 0 6px', letterSpacing: -0.5 }}>
            Submit a New Contact
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Add a new investor lead or contact to the pipeline
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#fff', borderRadius: 16, padding: '32px 28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '18px 14px',
          }}>
            {FIELDS.map(f => (
              <div key={f.key} style={{ gridColumn: f.half ? undefined : '1 / -1' }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600, color: '#475569',
                  marginBottom: 6, letterSpacing: 0.2,
                }}>
                  {f.label}{f.required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
                </label>

                {f.type === 'select' ? (
                  <select value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} style={{
                    ...inputBase, cursor: 'pointer',
                    color: form[f.key] ? '#1e293b' : '#94a3b8',
                  }}>
                    <option value="">Select...</option>
                    {f.options?.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                    rows={3} style={{ ...inputBase, resize: 'vertical' }}
                    placeholder="Any additional context or notes..."
                  />
                ) : (
                  <input
                    type={f.type} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                    style={inputBase}
                    placeholder={(f as any).placeholder || ''}
                    onFocus={e => { e.target.style.borderColor = '#1a1a2e'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,46,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 8,
              background: '#FEE2E2', color: '#991B1B', fontSize: 13, fontWeight: 500,
            }}>{error}</div>
          )}

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '14px 0', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            marginTop: 24, transition: 'opacity 0.15s',
            opacity: submitting ? 0.7 : 1, letterSpacing: 0.3,
          }}>
            {submitting ? 'Submitting...' : 'Submit Contact'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 20 }}>
          Submitted contacts will appear in the CRM for the team to review.
        </p>
      </div>
    </div>
  );
}
