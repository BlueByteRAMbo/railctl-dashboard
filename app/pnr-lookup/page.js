'use client';
import { useState } from 'react';

export default function PNRLookupPage() {
  const [pnr, setPnr] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPNR = async () => {
    if (!pnr.trim() || pnr.length !== 10) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`/api/pnr?pnr=${pnr.trim()}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const d = data?.data;

  const getStatusColor = (status) => {
    if (!status) return 'var(--text-muted)';
    const s = status.toUpperCase();
    if (s.includes('CNF') || s.includes('CONFIRM')) return 'var(--green)';
    if (s.includes('WL') || s.includes('WAIT')) return 'var(--red)';
    if (s.includes('RAC')) return 'var(--amber)';
    return 'var(--blue)';
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">PNR LOOKUP</div>
        <div className="page-subtitle">PASSENGER NAME RECORD STATUS · IRCTC API</div>
      </div>

      <div className="page-body">
        <div className="input-group">
          <div className="input-field">
            <label>PNR Number (10 digits)</label>
            <input
              value={pnr}
              onChange={e => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onKeyDown={e => e.key === 'Enter' && fetchPNR()}
              placeholder="e.g. 2145678901"
              maxLength={10}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={fetchPNR}
            disabled={loading || pnr.length !== 10}
          >
            {loading ? 'FETCHING...' : 'CHECK PNR'}
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loader"></div>
            <span>Fetching PNR details...</span>
          </div>
        )}

        {error && <div className="error-state">⚠ {error}</div>}

        {d && (
          <div className="animate-in">
            {/* PNR Summary */}
            <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 3, marginBottom: 8 }}>PNR NUMBER</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 3, color: 'var(--amber)' }}>{d.pnrNumber || pnr}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 6 }}>BOOKING STATUS</div>
                <span className="badge" style={{
                  background: `${getStatusColor(d.bookingStatus)}22`,
                  color: getStatusColor(d.bookingStatus),
                  border: `1px solid ${getStatusColor(d.bookingStatus)}44`,
                  fontSize: 13,
                  padding: '6px 16px',
                }}>
                  {d.bookingStatus || 'UNKNOWN'}
                </span>
              </div>
            </div>

            {/* Journey details */}
            <div className="pnr-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
              {[
                { label: 'Train', value: `${d.trainNumber} — ${d.trainName}` },
                { label: 'Date of Journey', value: d.dateOfJourney },
                { label: 'Class', value: d.travelClass },
                { label: 'From', value: d.fromStation },
                { label: 'To', value: d.toStation },
                { label: 'Boarding Point', value: d.boardingStation },
              ].map((f) => (
                <div className="pnr-field" key={f.label}>
                  <div className="pnr-field-label">{f.label}</div>
                  <div className="pnr-field-value">{f.value || '—'}</div>
                </div>
              ))}
            </div>

            {/* Passengers */}
            {d.passengerList && d.passengerList.length > 0 && (
              <>
                <div className="section-title">PASSENGERS</div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="passenger-row header">
                    <span>#</span>
                    <span>Status</span>
                    <span>Coach</span>
                    <span>Seat</span>
                    <span>Berth</span>
                  </div>
                  {d.passengerList.map((p, i) => (
                    <div className="passenger-row" key={i}>
                      <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{i + 1}</span>
                      <span style={{ color: getStatusColor(p.currentStatus), fontWeight: 600 }}>
                        {p.currentStatus || p.bookingStatus || '—'}
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>{p.currentCoachId || '—'}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{p.currentSeatNo || '—'}</span>
                      <span>{p.currentBerthCode || '—'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Chart status */}
            {d.chartStatus && (
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--blue)',
              }}>
                CHART STATUS: <strong>{d.chartStatus}</strong>
              </div>
            )}
          </div>
        )}

        {!loading && !data && !error && (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <div>Enter a 10-digit PNR number to check booking status</div>
          </div>
        )}
      </div>
    </>
  );
}
