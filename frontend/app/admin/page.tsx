'use client';
import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Ticket, Package, Clock, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import API from '@/lib/api';

const StatCard = ({ icon, label, value, sub, color }: any) => (
  <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{label}</span>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: 'var(--text2)', marginBottom: 4 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.dataKey === 'revenus' ? `${p.value.toLocaleString('fr')} F` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ color: 'var(--text3)', fontSize: 14 }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>Vue d'ensemble de votre activité</p>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard icon={<TrendingUp size={15} color="#3b82f6" />} label="Revenus ce mois" value={`${(stats?.revenus_mois || 0).toLocaleString('fr')} F`} sub={`Total: ${(stats?.revenus_total || 0).toLocaleString('fr')} F`} color="#3b82f6" />
        <StatCard icon={<ShoppingBag size={15} color="#10b981" />} label="Commandes ce mois" value={stats?.commandes_mois || 0} sub={`Total: ${stats?.total_commandes || 0}`} color="#10b981" />
        <StatCard icon={<Clock size={15} color="#f59e0b" />} label="En attente" value={stats?.commandes_en_attente || 0} sub="Commandes à traiter" color="#f59e0b" />
        <StatCard icon={<Package size={15} color="#8b5cf6" />} label="Stock vouchers" value={stats?.stock_disponible || 0} sub={`${stats?.stock_assigne || 0} utilisés`} color="#8b5cf6" />
        <StatCard icon={<Ticket size={15} color="#06b6d4" />} label="Sites actifs" value={stats?.total_sites || 0} sub={`${stats?.total_forfaits || 0} forfaits`} color="#06b6d4" />
      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Revenus 7 jours */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 20 }}>Revenus — 7 derniers jours</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stats?.graphData || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenus" name="Revenus" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Commandes 7 jours */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 20 }}>Commandes — 7 derniers jours</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats?.graphData || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="commandes" name="Commandes" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP FORFAITS */}
      {stats?.top_forfaits?.length > 0 && (
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Top forfaits vendus</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.top_forfaits.map((f: any, i: number) => (
              <div key={f.forfait_id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text3)', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{f.nom}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{f._count.id} ventes</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent2)' }}>{(f._sum.montant || 0).toLocaleString('fr')} F</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMMANDES EN ATTENTE RAPIDE */}
      {stats?.commandes_en_attente > 0 && (
        <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="var(--warning)" />
            <span style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 500 }}>
              {stats.commandes_en_attente} commande{stats.commandes_en_attente > 1 ? 's' : ''} en attente d'un ticket
            </span>
          </div>
          <a href="/admin/commandes" style={{ fontSize: 12, color: 'var(--warning)', textDecoration: 'none', fontWeight: 500 }}>Voir →</a>
        </div>
      )}
    </div>
  );
}
