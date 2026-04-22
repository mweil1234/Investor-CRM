'use client';
import { useState } from 'react';

export default function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pw === process.env.NEXT_PUBLIC_APP_PASSWORD) {
        sessionStorage.setItem('crm_auth', 'true');
        onAuth();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Background grid texture */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <form onSubmit={handleSubmit} className="animate-scale" style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '48px 40px',
        width: '100%', maxWidth: 400,
        textAlign: 'center',
      }}>
        {/* Logo mark */}
        <div style={{
          width: 56, height: 56, borderRadius: 14, margin: '0 auto 24px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -1,
        }}>BD</div>

        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Biz Development CRM
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 32 }}>
          Enter your team password to continue
        </p>

        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 10,
            border: `1.5px solid ${error ? '#EF4444' : 'rgba(255,255,255,0.12)'}`,
            background: 'rgba(255,255,255,0.06)',
            color: '#fff', fontSize: 15, outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = error ? '#EF4444' : 'rgba(255,255,255,0.3)'}
          onBlur={e => e.target.style.borderColor = error ? '#EF4444' : 'rgba(255,255,255,0.12)'}
        />

        {error && (
          <p className="animate-fade" style={{
            color: '#EF4444', fontSize: 13, marginTop: 10, fontWeight: 500,
          }}>Incorrect password. Try again.</p>
        )}

        <button type="submit" disabled={loading || !pw} style={{
          width: '100%', padding: '14px 0', borderRadius: 10,
          border: 'none', marginTop: 16,
          background: pw ? 'linear-gradient(135deg, #fff, #e2e8f0)' : 'rgba(255,255,255,0.08)',
          color: pw ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
          fontSize: 14, fontWeight: 700, cursor: pw ? 'pointer' : 'default',
          transition: 'all 0.2s', letterSpacing: 0.3,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Verifying...' : 'Enter CRM'}
        </button>
      </form>
    </div>
  );
}
