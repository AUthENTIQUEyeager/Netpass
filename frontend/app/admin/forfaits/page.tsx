'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import API from '@/lib/api';

const EMPTY = { nom: '', prix: '', duree_heures: '', vitesse: '', description: '', wave_link: '' };

export default function AdminForfaits() {
  const [forfaits, setForfaits] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => API.get('/api/forfaits/all').then(r => setForfaits(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (f: any) => {
    setEditing(f);
    setForm({ nom: f.nom, prix: String(f.prix), duree_heures: String(f.duree_heures), vitesse: f.vitesse, description: f.description || '', wave_link: f.wave_link || '' });
    setError(''); setShowModal(true);
  };

  const save = async () => {
    if (!form.nom || !form.prix || !form.duree_heures || !form.vitesse) { setError('Remplissez tous les champs obligatoires'); return; }
    setLoading(true); setError('');
    try {
      if (editing) {
        await API.put(`/api/forfaits/${editing.id}`, form);
      } else {
        await API.post('/api/forfaits', form);
      }
      setShowModal(false); load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur');
    } finally { setLoading(false); }
  };

  const toggle = async (f: any) => {
    await API.put(`/api/forfaits/${f.id}`, { actif: !f.actif });
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Désactiver ce forfait ?')) return;
    await API.delete(`/api/forfaits/${id}`);
    load();
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Forfaits</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>{forfaits.filter(f => f.actif).length} actifs</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Plus size={15} /> Nouveau forfait
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom</th><th>Prix</th><th>Durée</th><th>Vitesse</th><th>Lien Wave</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forfaits.map(f => (
              <tr key={f.id}>
                <td style={{ color: 'var(--text)', fontWeight: 500 }}>{f.nom}</td>
                <td>{f.prix.toLocaleString('fr')} F</td>
                <td>{f.duree_heures}h</td>
                <td>{f.vitesse}</td>
                <td>{f.wave_link ? <span style={{ fontSize: 11, color: 'var(--success)' }}>✓ Configuré</span> : <span style={{ fontSize: 11, color: 'var(--text3)' }}>—</span>}</td>
                <td>
                  <span className={`badge ${f.actif ? 'badge-green' : 'badge-gray'}`}>
                    {f.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(f)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><Pencil size={14} /></button>
                    <button onClick={() => del(f.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }}><Trash2 size={14} /></button>
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
              <h2 style={{ fontSize: 17 }}>{editing ? 'Modifier le forfait' : 'Nouveau forfait'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            {error && <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12 }}>{error}</div>}

            {[
              { key: 'nom', label: 'Nom *', placeholder: 'ex: 1 heure' },
              { key: 'prix', label: 'Prix (FCFA) *', placeholder: 'ex: 500', type: 'number' },
              { key: 'duree_heures', label: 'Durée (heures) *', placeholder: 'ex: 1', type: 'number' },
              { key: 'vitesse', label: 'Vitesse *', placeholder: 'ex: 5 Mbps' },
              { key: 'description', label: 'Description (séparée par virgules)', placeholder: 'ex: Navigation web,Réseaux sociaux' },
              { key: 'wave_link', label: 'Lien Wave (paiement)', placeholder: 'https://pay.wave.com/...' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{field.label}</label>
                <input type={field.type || 'text'} placeholder={field.placeholder}
                  value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="form-input" />
              </div>
            ))}

            <button onClick={save} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
              {loading ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer le forfait'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
