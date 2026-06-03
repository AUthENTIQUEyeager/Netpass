'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Tag, MapPin, Ticket, ShoppingBag, LogOut, Wifi, Menu, X } from 'lucide-react';

const NAV = [
  { href: '/admin',           icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { href: '/admin/forfaits',  icon: <Tag size={16} />,             label: 'Forfaits' },
  { href: '/admin/sites',     icon: <MapPin size={16} />,          label: 'Sites' },
  { href: '/admin/vouchers',  icon: <Ticket size={16} />,          label: 'Vouchers' },
  { href: '/admin/commandes', icon: <ShoppingBag size={16} />,     label: 'Commandes' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = localStorage.getItem('wp_token');
    const adminData = localStorage.getItem('wp_admin');
    if (!token) { router.push('/admin/login'); return; }
    if (adminData) setAdmin(JSON.parse(adminData));
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem('wp_token');
    localStorage.removeItem('wp_admin');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  const Sidebar = () => (
    <div style={{ width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', height: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wifi size={15} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>WifiPass</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>Administration</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9, marginBottom: 2, textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'white' : 'var(--text2)', background: active ? 'var(--accent)' : 'transparent', transition: 'all 0.15s' }}>
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        {admin && <div style={{ padding: '8px 10px', marginBottom: 4, fontSize: 12, color: 'var(--text3)' }}>{admin.nom}</div>}
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, width: '100%' }}>
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'none' }} className="sidebar-desktop"><Sidebar /></div>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', width: '100%' }}>
        <div style={{ width: 220, flexShrink: 0 }}><Sidebar /></div>
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
