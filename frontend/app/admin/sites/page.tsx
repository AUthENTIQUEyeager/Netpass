'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import API from '@/lib/api';

const EMPTY = { nom: '', ville: '' };

export default function AdminSites() {
  const [sites, setSites] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => API.get('/api/sites/all').then(r => setSites(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ nom: s.nom, ville: s.ville }); setError(''); setShowModal(true); };

  const save = async () => {
    if (!form.nom || !form.ville) { setError('Remplissez tous les champs'); return; }
    setLoading(true); setError('');
    try {
      if (editing) await API.put(`/api/sites/${editing.id}`, form);
      else await API.post('/api/sites', form);
      setShowModal(false); load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur');
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Désactiver ce site ?')) return;
    await API.delete(`/api/sites/${id}`);
    load();
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Sites WiFi</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>{sites.filter(s => s.actif).length} sites actifs</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Plus size={15} /> Nouveau site
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Nom</th><th>Ville</th><th>Stock disponible</th><th>Commandes</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {sites.map(s => (
              <tr key={s.id}>
                <td style={{ color: 'var(--text)', fontWeight: 500 }}>{s.nom}</td>
                <td>{s.ville}</td>
                <td>
                  <span style={{ color: (s._count?.vouchers || 0) < 5 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                    {s._count?.vouchers || 0} vouchers
                  </span>
                </td>
                <td>{s._count?.commandes || 0}</td>
                <td><span className={`badge ${s.actif ? 'badge-green' : 'badge-gray'}`}>{s.actif ? 'Actif' : 'Inactif'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(s)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><Pencil size={14} /></button>
                    <button onClick={() => del(s.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17 }}>{editing ? 'Modifier le site' : 'Nouveau site'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            {error && <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12 }}>{error}</div>}

            {[
              { key: 'nom', label: 'Nom du site *', placeholder: 'ex: Café Central' },
              { key: 'ville', label: 'Ville *', placeholder: 'ex: Dakar' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{field.label}</label>
                <input type="text" placeholder={field.placeholder}
                  value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="form-input" />
              </div>
            ))}

            <button onClick={save} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
              {loading ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer le site'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
