'use client';
import Link from 'next/link';
import { Wifi, Zap, Shield, Clock, ArrowRight, Search } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wifi size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>TouféWifi</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/mon-ticket" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 13, textDecoration: 'none', transition: 'all 0.2s' }}>
            <Search size={13} /> Mon ticket
          </Link>
          <Link href="/forfaits" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: 'white', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            Acheter <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)' }} />
          <span style={{ fontSize: 12, color: 'var(--accent2)', fontWeight: 500 }}>Paiement Wave · Ticket instantané</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
          Internet WiFi<br />
          <span style={{ color: 'var(--accent2)' }}>sans abonnement</span>
        </h1>

        <p style={{ color: 'var(--text2)', fontSize: 16, maxWidth: 480, lineHeight: 1.6, marginBottom: 36 }}>
          Choisissez votre forfait, payez avec Wave en 30 secondes et connectez-vous immédiatement.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/forfaits" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 12, background: 'var(--accent)', color: 'white', fontWeight: 600, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 32px rgba(37,99,235,0.3)' }}>
            Voir les forfaits <ArrowRight size={16} />
          </Link>
          <Link href="/mon-ticket" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, textDecoration: 'none' }}>
            <Search size={16} /> Récupérer mon ticket
          </Link>
        </div>

        {/* FEATURES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 64, width: '100%', maxWidth: 700 }}>
          {[
            { icon: <Zap size={18} color="var(--accent2)" />, title: 'Rapide', desc: 'Ticket disponible en moins de 2 minutes' },
            { icon: <Shield size={18} color="var(--success)" />, title: 'Sécurisé', desc: 'Paiement via Wave, 100% sécurisé' },
            { icon: <Clock size={18} color="var(--warning)" />, title: 'Flexible', desc: 'Du 1h au forfait journalier' },
          ].map((f, i) => (
            <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', textAlign: 'left' }}>
              <div style={{ marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
              <div style={{ color: 'var(--text3)', fontSize: 12, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
        © {new Date().getFullYear()} TouféWifi — Tous droits réservés
      </footer>
    </div>
  );
}
