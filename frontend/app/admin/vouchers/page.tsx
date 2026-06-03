'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Package, AlertTriangle } from 'lucide-react';
import API from '@/lib/api';

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [forfaits, setForfaits] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterSite, setFilterSite] = useState('');
  const [filterForfait, setFilterForfait] = useState('');
  const [filterStatut, setFilterStatut] = useState('disponible');
  const [form, setForm] = useState({ site_id: '', forfait_id: '', texte: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [total, setTotal] = useState(0);

  const load = async () => {
    const params = new URLSearchParams();
    if (filterSite) params.set('site_id', filterSite);
    if (filterForfait) params.set('forfait_id', filterForfait);
    if (filterStatut) params.set('statut', filterStatut);

    const [vRes, sRes] = await Promise.all([
      API.get(`/api/vouchers?${params}`),
      API.get('/api/vouchers/stock')
    ]);
    setVouchers(vRes.data.vouchers);
    setTotal(vRes.data.total);
    setSites(sRes.data.sites);
    setForfaits(sRes.data.forfaits);
    setStock(sRes.data.stock);
  };

  useEffect(() => { load(); }, [filterSite, filterForfait, filterStatut]);

  // Résumé stock disponible par site+forfait
  const getStock = (site_id: string, forfait_id: string) => {
    const entry = stock.find(s => s.site_id === site_id && s.forfait_id === forfait_id && s.statut === 'disponible');
    return entry?._count?.id || 0;
  };

  const handleImport = async () => {
    if (!form.site_id || !form.forfait_id || !form.texte.trim()) { setError('Remplissez tous les champs'); return; }

    // Parser le texte : chaque ligne = "username password" ou "username,password"
    const lines = form.texte.trim().split('\n').filter(l => l.trim());
    const vouchers = lines.map(line => {
      const parts = line.trim().split(/[\s,;]+/);
      return { username: parts[0], password: parts[1] || parts[0] };
    }).filter(v => v.username && v.password);

    if (vouchers.length === 0) { setError('Aucun voucher valide trouvé. Format: "username password" par ligne'); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await API.post('/api/vouchers', { site_id: form.site_id, forfait_id: form.forfait_id, vouchers });
      setSuccess(`${res.data.count} vouchers importés avec succès !`);
      setForm(p => ({ ...p, texte: '' }));
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur import');
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Supprimer ce voucher ?')) return;
    await API.delete(`/api/vouchers/${id}`);
    load();
  };

  // Sites avec peu de stock
  const alertes = sites.map(s => {
    const total_dispo = forfaits.reduce((acc, f) => acc + getStock(s.id, f.id), 0);
    return { ...s, total_dispo };
  }).filter(s => s.total_dispo < 5 && s.actif);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Vouchers</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>{total} voucher{total > 1 ? 's' : ''} — filtre actif</p>
        </div>
        <button onClick={() => { setError(''); setSuccess(''); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Plus size={15} /> Importer des vouchers
        </button>
      </div>

      {/* ALERTES STOCK BAS */}
      {alertes.length > 0 && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} color="var(--warning)" />
          <span style={{ fontSize: 13, color: 'var(--warning)' }}>
            Stock bas : {alertes.map(a => `${a.nom} (${a.total_dispo})`).join(', ')}
          </span>
        </div>
      )}

      {/* STOCK RÉSUMÉ */}
      {sites.length > 0 && forfaits.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          {sites.filter(s => s.actif).map(s => (
            <div key={s.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{s.nom}</div>
              {forfaits.map(f => {
                const dispo = getStock(s.id, f.id);
                return (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: 'var(--text3)' }}>{f.nom}</span>
                    <span style={{ fontWeight: 600, color: dispo === 0 ? 'var(--danger)' : dispo < 5 ? 'var(--warning)' : 'var(--success)' }}>
                      {dispo}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* FILTRES */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filterSite} onChange={e => setFilterSite(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Tous les sites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
        <select value={filterForfait} onChange={e => setFilterForfait(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Tous les forfaits</option>
          {forfaits.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 140 }}>
          <option value="">Tous les statuts</option>
          <option value="disponible">Disponible</option>
          <option value="assigné">Assigné</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Username</th><th>Mot de passe</th><th>Site</th><th>Forfait</th><th>Statut</th><th>Ajouté le</th><th>Action</th></tr>
          </thead>
          <tbody>
            {vouchers.map(v => (
              <tr key={v.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text)' }}>{v.username}</td>
                <td style={{ fontFamily: 'monospace' }}>{v.password}</td>
                <td>{v.site?.nom}</td>
                <td>{v.forfait?.nom}</td>
                <td><span className={`badge ${v.statut === 'disponible' ? 'badge-green' : 'badge-blue'}`}>{v.statut}</span></td>
                <td>{new Date(v.created_at).toLocaleDateString('fr-FR')}</td>
                <td>
                  {v.statut === 'disponible' && (
                    <button onClick={() => del(v.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: 32 }}>Aucun voucher trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL IMPORT */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17 }}>Importer des vouchers</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            {error && <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12 }}>{error}</div>}
            {success && <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--success)', fontSize: 12 }}>{success}</div>}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Site *</label>
              <select value={form.site_id} onChange={e => setForm(p => ({ ...p, site_id: e.target.value }))} className="form-input">
                <option value="">Sélectionnez un site</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.nom} — {s.ville}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Forfait *</label>
              <select value={form.forfait_id} onChange={e => setForm(p => ({ ...p, forfait_id: e.target.value }))} className="form-input">
                <option value="">Sélectionnez un forfait</option>
                {forfaits.map(f => <option key={f.id} value={f.id}>{f.nom} — {f.prix.toLocaleString('fr')} F</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
                Vouchers * <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(une ligne = un voucher : "username password")</span>
              </label>
              <textarea
                value={form.texte}
                onChange={e => setForm(p => ({ ...p, texte: e.target.value }))}
                placeholder={"user001 pass001\nuser002 pass002\nuser003 pass003"}
                className="form-input"
                style={{ minHeight: 160, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
              />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
                {form.texte.trim() ? `${form.texte.trim().split('\n').filter(l => l.trim()).length} vouchers détectés` : 'Collez vos vouchers MikroTik ici'}
              </div>
            </div>

            <button onClick={handleImport} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
              {loading ? 'Importation...' : 'Importer les vouchers'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
