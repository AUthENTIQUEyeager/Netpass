'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, Clock, X, Ticket } from 'lucide-react';
import API from '@/lib/api';

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [filterStatut, setFilterStatut] = useState('en_attente');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const params = new URLSearchParams();
    if (filterStatut) params.set('statut', filterStatut);
    const res = await API.get(`/api/commandes?${params}`);
    setCommandes(res.data.commandes);
    setTotal(res.data.total);
  };

  useEffect(() => { load(); }, [filterStatut]);

  const openAssign = async (commande: any) => {
    setSelected(commande);
    setSelectedVoucher('');
    setError('');
    setSuccess('');

    // Charger les vouchers disponibles pour ce site + forfait
    const res = await API.get(`/api/vouchers?site_id=${commande.site_id}&forfait_id=${commande.forfait_id}&statut=disponible`);
    setVouchers(res.data.vouchers);
    setShowModal(true);
  };

  // Récupérer site_id et forfait_id depuis les données de commande
  const openAssignWithIds = async (commande: any) => {
    setSelected(commande);
    setSelectedVoucher('');
    setError('');
    setSuccess('');

    try {
      const detail = await API.get(`/api/commandes/${commande.id}`).then(r => r.data);
      // Récupérer les vouchers disponibles via le site et forfait
      const siteName = detail.site?.nom;
      const forfaitNom = detail.forfait?.nom;

      // On cherche par site_id depuis la liste sites
      const sitesRes = await API.get('/api/sites/all');
      const forfaitsRes = await API.get('/api/forfaits/all');
      const site = sitesRes.data.find((s: any) => s.nom === siteName);
      const forfait = forfaitsRes.data.find((f: any) => f.nom === forfaitNom);

      if (site && forfait) {
        const vRes = await API.get(`/api/vouchers?site_id=${site.id}&forfait_id=${forfait.id}&statut=disponible`);
        setVouchers(vRes.data.vouchers);
      } else {
        // Tous les vouchers disponibles
        const vRes = await API.get(`/api/vouchers?statut=disponible`);
        setVouchers(vRes.data.vouchers);
      }
    } catch {
      const vRes = await API.get(`/api/vouchers?statut=disponible`);
      setVouchers(vRes.data.vouchers);
    }
    setShowModal(true);
  };

  const assign = async () => {
    if (!selectedVoucher) { setError('Sélectionnez un voucher'); return; }
    setLoading(true); setError('');
    try {
      await API.post('/api/vouchers/assigner', { commande_id: selected.id, voucher_id: selectedVoucher });
      setSuccess('Voucher assigné ! Le client peut maintenant voir son ticket.');
      load();
      setTimeout(() => setShowModal(false), 2000);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur');
    } finally { setLoading(false); }
  };

  const statutBadge = (s: string) => {
    if (s === 'ticket_assigné') return <span className="badge badge-green"><CheckCircle size={9} /> Ticket assigné</span>;
    return <span className="badge badge-yellow"><Clock size={9} /> En attente</span>;
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Commandes</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>{total} commande{total > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['en_attente', 'ticket_assigné', ''].map(s => (
            <button key={s} onClick={() => setFilterStatut(s)}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: filterStatut === s ? 'var(--accent)' : 'transparent', color: filterStatut === s ? 'white' : 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>
              {s === '' ? 'Toutes' : s === 'en_attente' ? 'En attente' : 'Assignées'}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Date</th><th>Forfait</th><th>Site</th><th>Montant</th><th>Client</th><th>Ticket</th><th>Statut</th><th>Action</th></tr>
          </thead>
          <tbody>
            {commandes.map(c => (
              <tr key={c.id}>
                <td>{new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ color: 'var(--text)', fontWeight: 500 }}>{c.forfait?.nom}</td>
                <td>{c.site?.nom}</td>
                <td style={{ fontWeight: 600 }}>{c.montant?.toLocaleString('fr')} F</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.client_tel || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent2)' }}>
                  {c.ticket?.voucher?.username || '—'}
                </td>
                <td>{statutBadge(c.statut)}</td>
                <td>
                  {c.statut === 'en_attente' && (
                    <button onClick={() => openAssignWithIds(c)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: 'var(--accent2)', cursor: 'pointer', fontSize: 12 }}>
                      <Ticket size={12} /> Assigner
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {commandes.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text3)', padding: 32 }}>Aucune commande</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL ASSIGNATION */}
      {showModal && selected && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17 }}>Assigner un voucher</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            {/* Détails commande */}
            <div style={{ background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text3)' }}>Forfait</span>
                <span style={{ fontWeight: 600 }}>{selected.forfait?.nom}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text3)' }}>Site</span>
                <span style={{ fontWeight: 600 }}>{selected.site?.nom}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text3)' }}>Montant</span>
                <span style={{ fontWeight: 600 }}>{selected.montant?.toLocaleString('fr')} F</span>
              </div>
              {selected.client_tel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text3)' }}>Client</span>
                  <span style={{ fontFamily: 'monospace' }}>{selected.client_tel}</span>
                </div>
              )}
            </div>

            {error && <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12 }}>{error}</div>}
            {success && <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--success)', fontSize: 13 }}>{success}</div>}

            {!success && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
                    Choisir un voucher ({vouchers.length} disponible{vouchers.length > 1 ? 's' : ''})
                  </label>
                  {vouchers.length === 0 ? (
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: 'var(--danger)', fontSize: 13 }}>
                      Aucun voucher disponible pour ce site/forfait. Importez-en d'abord.
                    </div>
                  ) : (
                    <select value={selectedVoucher} onChange={e => setSelectedVoucher(e.target.value)} className="form-input">
                      <option value="">Sélectionnez un voucher</option>
                      {vouchers.map(v => (
                        <option key={v.id} value={v.id}>{v.username} / {v.password}</option>
                      ))}
                    </select>
                  )}
                </div>

                <button onClick={assign} disabled={loading || !selectedVoucher || vouchers.length === 0} className="btn-primary" style={{ width: '100%' }}>
                  {loading ? 'Assignation...' : 'Confirmer l\'assignation'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
