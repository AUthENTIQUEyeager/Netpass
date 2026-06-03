'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, Zap, Star, ArrowLeft, Phone, X, Shield, Search } from 'lucide-react';
import { getForfaits, getSites } from '@/lib/api';
import API from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForfaitsPage() {
  const router = useRouter();
  const [forfaits, setForfaits] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedForfait, setSelectedForfait] = useState<any>(null);
  const [clientTel, setClientTel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getForfaits().then(setForfaits).catch(() => setError('Erreur chargement forfaits'));
    getSites().then(data => {
      setSites(data);
      if (data.length === 1) setSelectedSite(data[0].id);
    });
  }, []);

  const handleAchat = (forfait: any) => {
    if (!selectedSite) { setError('Sélectionnez un site WiFi'); return; }
    setError('');
    setSelectedForfait(forfait);
    setClientTel('');
    setShowPopup(true);
  };

  const handlePayer = async () => {
    if (clientTel.length < 8) return;
    setLoading(true);
    try {
      const data = await API.post('/api/commandes', {
        forfait_id: selectedForfait.id,
        site_id: selectedSite,
        client_tel: clientTel
      }).then(r => r.data);

      if (data.checkout_url) {
        // Sauvegarder l'ID commande pour retrouver le ticket après retour Wave
        localStorage.setItem('wp_last_commande', data.commande_id);
        window.location.href = data.checkout_url;
      } else {
        // Pas de lien Wave configuré — rediriger vers page d'attente
        router.push(`/ticket?id=${data.commande_id}`);
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.response?.data?.error || 'Erreur lors de la commande');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 13, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Retour
        </Link>
        <span style={{ color: 'var(--border2)', fontSize: 16 }}>|</span>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>Choisir un forfait</span>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, marginBottom: 10 }}>Nos forfaits</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>Payez avec Wave, recevez votre accès instantanément.</p>
        </div>

        {/* SITE SELECTOR */}
        {sites.length > 1 && (
          <div style={{ maxWidth: 320, margin: '0 auto 36px' }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Site WiFi
            </label>
            <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)} className="form-input">
              <option value="">Sélectionnez un site</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.nom} — {s.ville}</option>)}
            </select>
          </div>
        )}

        {error && (
          <div style={{ maxWidth: 400, margin: '0 auto 24px', padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* FORFAITS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {forfaits.map((f, i) => (
            <div key={f.id} style={{
              position: 'relative', background: 'var(--bg3)', border: `1px solid ${i === 1 ? 'rgba(37,99,235,0.4)' : 'var(--border)'}`,
              borderRadius: 18, padding: '24px 20px', display: 'flex', flexDirection: 'column',
              boxShadow: i === 1 ? '0 0 40px rgba(37,99,235,0.1)' : 'none',
              transition: 'transform 0.2s, border-color 0.2s'
            }}>
              {i === 1 && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 100, background: 'var(--accent)', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  <Star size={9} fill="currentColor" /> Populaire
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{f.nom}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{f.prix.toLocaleString('fr')}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>FCFA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 20 }}>
                <Zap size={11} color="var(--accent2)" />
                <span style={{ fontSize: 12, color: 'var(--accent2)', fontWeight: 500 }}>{f.vitesse}</span>
              </div>

              <ul style={{ listStyle: 'none', flex: 1, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(f.description ? f.description.split(',') : [`${f.duree_heures}h de connexion`, 'Ticket instantané']).map((feat: string, fi: number) => (
                  <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'var(--text2)' }}>
                    <CheckCircle size={12} color="var(--accent2)" style={{ flexShrink: 0, marginTop: 1 }} />
                    {feat.trim()}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleAchat(f)} className="btn-primary" style={{ width: '100%', background: i === 1 ? 'var(--accent)' : 'rgba(255,255,255,0.06)', color: 'white', border: i === 1 ? 'none' : '1px solid var(--border)' }}>
                Payer avec Wave
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14 }}>
            <Shield size={20} color="var(--accent2)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Paiement sécurisé Wave</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Votre ticket vous sera envoyé après confirmation.</div>
            </div>
          </div>
          <Link href="/mon-ticket" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 14, color: 'var(--accent2)', fontSize: 13, textDecoration: 'none' }}>
            <Search size={15} /> Récupérer mon ticket
          </Link>
        </div>
      </div>

      {/* POPUP */}
      {showPopup && selectedForfait && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowPopup(false)} />
          <div className="modal-box">
            <button onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
              <X size={16} />
            </button>

            <h3 style={{ fontSize: 16, marginBottom: 6 }}>Votre numéro</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Laissez votre numéro pour récupérer votre ticket après paiement.</p>

            <div style={{ background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedForfait.nom}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{selectedForfait.vitesse} — {selectedForfait.duree_heures}h</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{selectedForfait.prix.toLocaleString('fr')} F</span>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
              <Phone size={11} /> Numéro de téléphone
            </label>
            <input type="tel" placeholder="ex: 77 123 45 67" value={clientTel}
              onChange={e => setClientTel(e.target.value)}
              className="form-input" style={{ marginBottom: 20 }} autoFocus />

            <button onClick={handlePayer} disabled={loading || clientTel.length < 8} className="btn-primary" style={{ width: '100%' }}>
              {loading ? 'Redirection...' : 'Continuer vers Wave →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
