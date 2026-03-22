'use client';
import { useState } from 'react';

export default function TrainsBetweenPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrains = async () => {
    if (!from.trim() || !to.trim() || !date) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const formattedDate = date.split('-').reverse().join('-'); // Convert YYYY-MM-DD to DD-MM-YYYY
      const res = await fetch(`/api/trains-between?from=${from.trim().toUpperCase()}&to=${to.trim().toUpperCase()}&date=${formattedDate}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const trains = data?.data || [];

  const getDuration = (dep, arr) => {
    if (!dep || !arr) return '—';
    return ''; // API usually provides this
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">TRAINS BETWEEN STATIONS</div>
        <div className="page-subtitle">FIND ALL TRAINS ON A ROUTE · IRCTC API</div>
      </div>

      <div className="page-body">
        <div className="input-group">
          <div className="input-field">
            <label>From Station Code</label>
            <input
              value={from}
              onChange={e => setFrom(e.target.value.toUpperCase())}
              placeholder="e.g. NDLS"
            />
          </div>
          <div className="input-field">
            <label>To Station Code</label>
            <input
              value={to}
              onChange={e => setTo(e.target.value.toUpperCase())}
              placeholder="e.g. BCT"
            />
          </div>
          <div className="input-field">
            <label>Date of Journey</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={fetchTrains}
            disabled={loading || !from.trim() || !to.trim() || !date}
          >
            {loading ? 'SEARCHING...' : 'SEARCH TRAINS'}
          </button>
        </div>

        <div style={{ marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          Popular codes: NDLS (New Delhi), BCT (Mumbai CST), MAS (Chennai), HWH (Howrah), BLR (Bangalore)
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loader"></div>
            <span>Searching for trains...</span>
          </div>
        )}

        {error && <div className="error-state">⚠ {error}</div>}

        {data && trains.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div>No trains found for this route and date</div>
          </div>
        )}

        {trains.length > 0 && (
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="section-title" style={{ margin: 0 }}>
                {from} → {to} &nbsp;
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                  {trains.length} trains found
                </span>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid-3" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-label">Total Trains</div>
                <div className="card-value">{trains.length}</div>
              </div>
              <div className="card">
                <div className="card-label">Earliest Departure</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--green)' }}>
                  {trains.reduce((min, t) => t.departureTime < min ? t.departureTime : min, trains[0]?.departureTime || '—')}
                </div>
              </div>
              <div className="card">
                <div className="card-label">Latest Departure</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--amber)' }}>
                  {trains.reduce((max, t) => t.departureTime > max ? t.departureTime : max, trains[0]?.departureTime || '—')}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Train No.</th>
                    <th>Train Name</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Duration</th>
                    <th>Runs On</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {trains.map((t, i) => (
                    <tr key={i}>
                      <td><span className="train-number" style={{ fontSize: 18 }}>{t.trainNumber}</span></td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: 200 }}>{t.trainName}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--green)' }}>
                          {t.departureTime}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--amber)' }}>
                          {t.arrivalTime}
                        </span>
                      </td>
                      <td>{t.duration || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 120 }}>
                          {t.runDays?.map((day, j) => (
                            <span key={j} style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 9,
                              padding: '1px 5px',
                              background: 'var(--border)',
                              borderRadius: 3,
                              color: 'var(--text-secondary)',
                            }}>{day}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {t.trainType && (
                          <span className="badge badge-blue" style={{ fontSize: 9 }}>{t.trainType}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !data && !error && (
          <div className="empty-state">
            <div className="empty-icon">⇌</div>
            <div>Enter station codes and date to find trains</div>
          </div>
        )}
      </div>
    </>
  );
}
