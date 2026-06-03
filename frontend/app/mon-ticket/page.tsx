'use client';
import { useState } from 'react';
import { Search, ArrowLeft, Copy, Clock, CheckCircle } from 'lucide-react';
import API from '@/lib/api';
import Link from 'next/link';

export default function MonTicketPage() {
  const [tel, setTel] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const chercher = async () => {
    if (tel.length < 8) return;
    setLoading(true); setError(''); setTicket(null);
    try {
      const data = await API.get(`/api/commandes/client/${tel.replace(/\s/g, '')}`).then(r => r.data);
      setTicket(data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Aucun ticket trouvé pour ce numéro');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 13, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Retour
        </Link>
        <span style={{ color: 'var(--border2)' }}>|</span>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>Récupérer mon ticket</span>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 50, height: 50, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Search size={22} color="var(--accent2)" />
            </div>
            <h1 style={{ fontSize: 22, marginBottom: 8 }}>Mon ticket</h1>
            <p style={{ color: 'var(--text2)', fontSize: 13 }}>Entrez le numéro utilisé lors de l'achat.</p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input type="tel" placeholder="ex: 77 123 45 67" value={tel}
              onChange={e => setTel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && chercher()}
              className="form-input" style={{ flex: 1 }} />
            <button onClick={chercher} disabled={loading || tel.length < 8} className="btn-primary" style={{ padding: '11px 18px', flexShrink: 0 }}>
              {loading ? '...' : <Search size={15} />}
            </button>
          </div>

          {error && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
              {error}
            </div>
          )}

          {ticket && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <CheckCircle size={16} color="var(--success)" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Ticket trouvé</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Forfait</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ticket.forfait}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Site</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ticket.site}</div>
                </div>
              </div>

              {[
                { label: 'Nom d\'utilisateur', value: ticket.username, key: 'user' },
                { label: 'Mot de passe', value: ticket.password, key: 'pass' }
              ].map(field => (
                <div key={field.key} style={{ background: 'var(--bg4)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{field.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700 }}>{field.value}</div>
                  </div>
                  <button onClick={() => copy(field.value, field.key)} style={{ background: copied === field.key ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied === field.key ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: copied === field.key ? 'var(--success)' : 'var(--text2)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Copy size={11} /> {copied === field.key ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              ))}

              {ticket.date_expiration && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '9px 12px', background: 'rgba(37,99,235,0.06)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.15)' }}>
                  <Clock size={12} color="var(--accent2)" />
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                    Expire le {new Date(ticket.date_expiration).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
