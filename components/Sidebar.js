'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '⬡', label: 'Overview' },
  { href: '/live-status', icon: '◉', label: 'Live Status' },
  { href: '/pnr-lookup', icon: '◈', label: 'PNR Lookup' },
  { href: '/station-schedule', icon: '◫', label: 'Station Schedule' },
  { href: '/trains-between', icon: '⇌', label: 'Trains Between' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🚆 RAILCTL</div>
        <div className="logo-sub">Admin Dashboard</div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${pathname === item.href ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="status-dot"></span>
        SYSTEM ONLINE
        <div style={{ marginTop: 4, fontSize: 9 }}>IRCTC API v3 · RapidAPI</div>
      </div>
    </aside>
  );
}
