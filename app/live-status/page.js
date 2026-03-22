'use client';
import React, { useState } from 'react';

export default function LiveStatusPage() {
  const [trainNo, setTrainNo] = useState('');
  const [data, setData] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLive, setIsLive] = useState(false);

  // We use this interval ref to clear it when the user stops tracking
  const intervalRef = React.useRef(null);
  const activeTrainRef = React.useRef('');

  const stopPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsLive(false);
    activeTrainRef.current = '';
  };

  const fetchStatus = async (trainNoOverride, silent = false) => {
    const tNo = trainNoOverride || trainNo.trim();
    if (!tNo) return;
    
    if (!silent) {
      setLoading(true);
      setError('');
      setData(null);
      setSchedule(null);
      stopPolling();
    }

    try {
      const [liveRes, schedRes] = await Promise.all([
        fetch(`/api/live-status?trainNo=${tNo}&date=0`),
        fetch(`/api/station-schedule?stationCode=${tNo}`)
      ]);
      const liveJson = await liveRes.json();
      const schedJson = await schedRes.json();

      if (liveJson.error) throw new Error(liveJson.error);
      setData(liveJson);

      const sd = schedJson?.data;
      const stations =
        sd?.stationList ||
        sd?.stations ||
        sd?.stationDetails ||
        sd?.route ||
        sd?.stoppage ||
        [];
      setSchedule({ stations, raw: sd });

      // Start polling if not already
      if (!silent) {
        setIsLive(true);
        activeTrainRef.current = tNo;
        intervalRef.current = setInterval(() => {
          if (activeTrainRef.current === tNo) {
             fetchStatus(tNo, true); // silent refresh
          }
        }, 5000);
      }
    } catch (e) {
      if (!silent) setError(e.message);
      stopPolling();
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => stopPolling();
  }, []);

  const t = data?.data;
  const stations = schedule?.stations || [];
  const getStationName = (s) => s?.stationName || s?.station_name || s?.name || '—';

  // Figure out current station index based on next_station_code or name
  let nextIdx = stations.findIndex(
    s => getStationName(s) === t?.next_station_name ||
         s.stationCode === t?.next_station_code ||
         s.station_code === t?.next_station_code ||
         s.code === t?.next_station_code
  );
  if (nextIdx === -1 && t?.next_station_name) {
    const srch = t.next_station_name.toLowerCase().substring(0, 6);
    nextIdx = stations.findIndex(s => getStationName(s).toLowerCase().includes(srch));
  }
  
  const currentIdx = nextIdx > 0 ? nextIdx - 1 : (t?.at_src ? 0 : -1);
  const progress = t?.at_dstn ? 100 :
    t?.at_src ? 2 :
    stations.length > 0 && currentIdx >= 0
      ? Math.round((currentIdx / (stations.length - 1)) * 100)
      : 0;


  const getStationCode = (s) => s?.stationCode || s?.station_code || s?.code || '—';
  const getArrival = (s) => s?.arrivalTime || s?.arrival_time || s?.arr || '—';
  const getDeparture = (s) => s?.departureTime || s?.departure_time || s?.dep || '—';
  const getHalt = (s) => s?.haltTime || s?.halt_time || s?.halt || null;
  const getDistance = (s) => s?.distance || s?.dist || null;
  const getPlatform = (s) => s?.platform || s?.pf || null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          LIVE TRAIN STATUS
          {isLive && <span className="badge badge-amber" style={{ marginLeft: 16, fontSize: 11 }}><span className="badge-dot" style={{ animation: 'pulse 1.5s infinite' }}></span>REALTIME INTERNAL API</span>}
        </div>
        <div className="page-subtitle">REAL-TIME TRACKING · INTERNAL MOCK API</div>
      </div>

      <div className="page-body">
        <div className="input-group">
          <div className="input-field">
            <label>Train Number</label>
            <input
              value={trainNo}
              onChange={e => {
                setTrainNo(e.target.value);
                if (e.target.value !== activeTrainRef.current) stopPolling();
              }}
              onKeyDown={e => e.key === 'Enter' && fetchStatus()}
              placeholder="e.g. 12301"
              maxLength={6}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => fetchStatus()}
            disabled={loading || !trainNo.trim()}
          >
            {loading ? 'TRACKING...' : 'TRACK TRAIN'}
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loader"></div>
            <span>Fetching live train data...</span>
          </div>
        )}

        {error && <div className="error-state">⚠ {error}</div>}

        {t && (
          <div className="animate-in">
            {/* Train header */}
            <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="train-number">{t.train_number}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: 2 }}>{t.train_name}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {t.source_stn_name} → {t.dest_stn_name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  Runs: {t.run_days} · Dep: {t.std?.split(' ')[1]} · Journey: {Math.floor(t.journey_time / 60)}h {t.journey_time % 60}m
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                {t.at_src && !t.at_dstn && (
                  <span className="badge badge-amber"><span className="badge-dot"></span>AT SOURCE</span>
                )}
                {t.at_dstn && (
                  <span className="badge badge-green"><span className="badge-dot"></span>ARRIVED</span>
                )}
                {!t.at_src && !t.at_dstn && (
                  <span className="badge badge-green"><span className="badge-dot"></span>EN ROUTE</span>
                )}
                {t.pantry_available && (
                  <span className="badge badge-blue"><span className="badge-dot"></span>PANTRY ✓</span>
                )}
              </div>
            </div>

            {/* Live message */}
            {t.new_message && (
              <div style={{
                marginBottom: 16,
                padding: '12px 16px',
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--amber)',
              }}>
                📡 {t.new_message}
              </div>
            )}

            {/* Progress track */}
            <div className="track-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2 }}>JOURNEY PROGRESS</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--amber)' }}>{progress}%</span>
              </div>
              <div className="track-bar">
                <div className="track-fill" style={{ width: `${Math.max(progress, 2)}%` }}>
                  <span className="track-train">🚆</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div className="track-station">
                  <div className="track-station-dot passed"></div>
                  <div className="track-station-name">{t.source}</div>
                </div>
                {t.next_station_code && !t.at_dstn && (
                  <div className="track-station" style={{ alignItems: 'center' }}>
                    <div className="track-station-dot current"></div>
                    <div className="track-station-name" style={{ textAlign: 'center' }}>
                      NEXT: {t.next_station_code}
                    </div>
                  </div>
                )}
                <div className="track-station" style={{ alignItems: 'flex-end' }}>
                  <div className={`track-station-dot${t.at_dstn ? ' passed' : ''}`}></div>
                  <div className="track-station-name">{t.destination}</div>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid-3" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-label">Next Station</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--green)' }}>
                  {t.next_station_code || '—'}
                </div>
                <div className="card-sub">{t.next_station_name || ''}</div>
              </div>
              <div className="card">
                <div className="card-label">Platform</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--amber)' }}>
                  {t.platform_number || '—'}
                </div>
              </div>
              <div className="card">
                <div className="card-label">Departure Date</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>
                  {t.train_start_date || '—'}
                </div>
                <div className="card-sub">{t.std?.split(' ')[1] || ''}</div>
              </div>
            </div>

            {/* Stations table */}
            {stations.length > 0 && (
              <>
                <div className="section-title">ALL STOPS</div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
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
                      {stations.map((st, i) => {
                        const isCurrent = i === nextIdx;
                        const isPassed = i < nextIdx;
                        return (
                          <tr key={i} style={isCurrent ? { background: 'rgba(16,185,129,0.06)' } : {}}>
                            <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                            <td style={{ color: isPassed ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: isCurrent ? 700 : 400 }}>
                              {getStationName(st)}
                            </td>
                            <td style={{ color: 'var(--amber)' }}>{getStationCode(st)}</td>
                            <td>{getArrival(st)}</td>
                            <td>{getDeparture(st)}</td>
                            <td>{getHalt(st) ? `${getHalt(st)} min` : '—'}</td>
                            <td>{getDistance(st) ? `${getDistance(st)} km` : '—'}</td>
                            <td>{getPlatform(st) || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {stations.length === 0 && (
              <div style={{
                padding: '16px 20px',
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--blue)',
              }}>
                ℹ Schedule data unavailable for this train — live position shown above.
              </div>
            )}
          </div>
        )}

        {!loading && !data && !error && (
          <div className="empty-state">
            <div className="empty-icon">🚆</div>
            <div>Enter a train number to start live tracking</div>
            <div style={{ marginTop: 6, fontSize: 10, color: 'var(--border-bright)' }}>
              e.g. 12301 (Howrah Rajdhani), 12138 (Punjab Mail)
            </div>
          </div>
        )}
      </div>
    </>
  );
}
