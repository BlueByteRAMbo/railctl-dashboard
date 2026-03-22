'use client';

export default function HomePage() {
  const stats = [
    { label: 'Total Trains Running', value: '13,169', sub: 'Daily across India', color: 'var(--amber)' },
    { label: 'Railway Stations', value: '7,349', sub: 'Across the network', color: 'var(--blue)' },
    { label: 'Daily Passengers', value: '23M+', sub: 'Avg. per day', color: 'var(--green)' },
    { label: 'Route KMs', value: '67,956', sub: 'Total track length', color: 'var(--text-primary)' },
  ];

  const features = [
    {
      icon: '◉',
      title: 'Live Train Status',
      desc: 'Track any train in real-time. Get current location, delay info, and upcoming station ETAs.',
      href: '/live-status',
      accent: '#10B981',
    },
    {
      icon: '◈',
      title: 'PNR Lookup',
      desc: 'Instantly check PNR status, passenger booking details, and seat allocation.',
      href: '/pnr-lookup',
      accent: '#F59E0B',
    },
    {
      icon: '◫',
      title: 'Station Schedule',
      desc: 'View complete timetable for any train — all stops, arrival & departure times.',
      href: '/station-schedule',
      accent: '#3B82F6',
    },
    {
      icon: '⇌',
      title: 'Trains Between Stations',
      desc: 'Find all trains between two stations on a specific date with timing info.',
      href: '/trains-between',
      accent: '#C084FC',
    },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-title">OVERVIEW</div>
        <div className="page-subtitle">INDIAN RAILWAYS INTERNAL REALTIME SYSTEM</div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {stats.map((s) => (
            <div className="card" key={s.label}>
              <div className="card-label">{s.label}</div>
              <div className="card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="card-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="section-title">QUICK ACCESS</div>
        <div className="grid-2">
          {features.map((f) => (
            <a key={f.href} href={f.href} className="feature-card-link">
              <div className="feature-card" style={{ '--accent': f.accent }}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
                <div className="feature-cta">OPEN MODULE →</div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </>
  );
}
