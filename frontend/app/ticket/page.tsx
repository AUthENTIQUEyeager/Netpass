'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, Copy, Wifi, RefreshCw } from 'lucide-react';
import API from '@/lib/api';
import Link from 'next/link';

export default function TicketPage() {
  const params = useSearchParams();
  const id = params.get('id') || (typeof window !== 'undefined' ? localStorage.getItem('wp_last_commande') : '');

  const [commande, setCommande] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string>('');
  const [polling, setPolling] = useState(true);

  const fetchCommande = async () => {
    if (!id) return;
    try {
      const data = await API.get(`/api/commandes/${id}`).then(r => r.data);
      setCommande(data);
      if (data.ticket) {
        setPolling(false);
        localStorage.removeItem('wp_last_commande');
      }
    } catch {
      setError('Commande introuvable');
      setPolling(false);
    }
  };

  useEffect(() => {
    fetchCommande();
  }, [id]);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(fetchCommande, 5000);
    return () => clearInterval(interval);
  }, [polling, id]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!id) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text2)', marginBottom: 16 }}>Aucune commande trouvée.</p>
        <Link href="/forfaits" className="btn-primary">Acheter un forfait</Link>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>
        <Link href="/forfaits" className="btn-primary">Retour aux forfaits</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {commande?.ticket ? (
          // ── TICKET DISPONIBLE ──────────────────────────────────────────
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={26} color="var(--success)" />
              </div>
              <h1 style={{ fontSize: 22, marginBottom: 6 }}>Votre ticket est prêt !</h1>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>Utilisez ces identifiants pour vous connecter au WiFi.</p>
            </div>

            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Forfait</div>
                  <div style={{ fontWeight: 600 }}>{commande.forfait.nom}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Site</div>
                  <div style={{ fontWeight: 600 }}>{commande.site.nom}</div>
                </div>
              </div>

              {[
                { label: 'Nom d\'utilisateur', value: commande.ticket.username, key: 'user' },
                { label: 'Mot de passe', value: commande.ticket.password, key: 'pass' }
              ].map(field => (
                <div key={field.key} style={{ background: 'var(--bg4)', borderRadius: 10, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{field.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>{field.value}</div>
                  </div>
                  <button onClick={() => copy(field.value, field.key)} style={{ background: copied === field.key ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied === field.key ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: copied === field.key ? 'var(--success)' : 'var(--text2)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Copy size={12} /> {copied === field.key ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '10px 14px', background: 'rgba(37,99,235,0.06)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.15)' }}>
                <Clock size={13} color="var(--accent2)" />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                  Expire le {new Date(commande.ticket.date_expiration).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/forfaits" className="btn-ghost" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Acheter un autre</Link>
              <button onClick={() => { copy(`Utilisateur: ${commande.ticket.username}\nMot de passe: ${commande.ticket.password}`, 'all'); }}
                className="btn-primary" style={{ flex: 1 }}>
                {copied === 'all' ? '✓ Copié !' : 'Tout copier'}
              </button>
            </div>
          </div>

        ) : (
          // ── EN ATTENTE ────────────────────────────────────────────────
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <RefreshCw size={24} color="var(--warning)" style={{ animation: 'spin 2s linear infinite' }} />
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>En attente de confirmation</h2>
            <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              Votre paiement est en cours de vérification.<br />
              Votre ticket sera disponible dans quelques instants.
            </p>

            {commande && (
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text2)' }}>Forfait</span>
                  <span style={{ fontWeight: 600 }}>{commande.forfait?.nom}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8 }}>
                  <span style={{ color: 'var(--text2)' }}>Montant</span>
                  <span style={{ fontWeight: 600 }}>{commande.montant?.toLocaleString('fr')} FCFA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8 }}>
                  <span style={{ color: 'var(--text2)' }}>Statut</span>
                  <span className="badge badge-yellow">En attente</span>
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              Cette page se rafraîchit automatiquement toutes les 5 secondes.
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
