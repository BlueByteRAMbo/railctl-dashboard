'use client';
import { useState } from 'react';

export default function StationSchedulePage() {
  const [trainNo, setTrainNo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSchedule = async () => {
    if (!trainNo.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`/api/station-schedule?stationCode=${trainNo.trim()}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const schedule = data?.data;

  return (
    <>
      <div className="page-header">
        <div className="page-title">TRAIN SCHEDULE</div>
        <div className="page-subtitle">FULL ROUTE TIMETABLE · IRCTC API</div>
      </div>

      <div className="page-body">
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--blue)' }}>
          ℹ Enter a train number to view its complete route schedule
        </div>

        <div className="input-group">
          <div className="input-field">
            <label>Train Number</label>
            <input
              value={trainNo}
              onChange={e => setTrainNo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchSchedule()}
              placeholder="e.g. 12301"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={fetchSchedule}
            disabled={loading || !trainNo.trim()}
          >
            {loading ? 'LOADING...' : 'GET SCHEDULE'}
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loader"></div>
            <span>Loading schedule...</span>
          </div>
        )}

        {error && <div className="error-state">⚠ {error}</div>}

        {schedule && (
          <div className="animate-in">
            {/* Header */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className="train-number">{schedule.trainNumber}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 2 }}>{schedule.trainName}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    Runs on: {schedule.runDays?.join(', ') || 'All days'}
                  </div>
                </div>
              </div>
            </div>

            {/* Duration stats */}
            {schedule.stationList && (
              <div className="grid-3" style={{ marginBottom: 20 }}>
                <div className="card">
                  <div className="card-label">Total Stops</div>
                  <div className="card-value">{schedule.stationList.length}</div>
                </div>
                <div className="card">
                  <div className="card-label">Origin</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1, color: 'var(--green)' }}>
                    {schedule.stationList[0]?.stationName}
                  </div>
                </div>
                <div className="card">
                  <div className="card-label">Destination</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1, color: 'var(--amber)' }}>
                    {schedule.stationList[schedule.stationList.length - 1]?.stationName}
                  </div>
                </div>
              </div>
            )}

            <div className="section-title">ROUTE TIMETABLE</div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>#</th>
                    <th>Station</th>
                    <th>Code</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                    <th>Halt</th>
                    <th>Distance</th>
                    <th>Platform</th>
                  </tr>
                </thead>
                <tbody>
                  {(schedule.stationList || []).map((st, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--amber)' }}>
                          {st.day || (i + 1)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{st.serialNumber || i + 1}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{st.stationName}</td>
                      <td style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{st.stationCode}</td>
                      <td>{i === 0 ? <span className="badge badge-green" style={{ fontSize: 9 }}>ORIGIN</span> : (st.arrivalTime || '—')}</td>
                      <td>{i === (schedule.stationList?.length - 1) ? <span className="badge badge-amber" style={{ fontSize: 9 }}>DEST</span> : (st.departureTime || '—')}</td>
                      <td>{st.haltTime ? `${st.haltTime} min` : '—'}</td>
                      <td>{st.distance ? `${st.distance} km` : '—'}</td>
                      <td>{st.platform || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !data && !error && (
          <div className="empty-state">
            <div className="empty-icon">◫</div>
            <div>Enter a train number to view its complete schedule</div>
          </div>
        )}
      </div>
    </>
  );
}
