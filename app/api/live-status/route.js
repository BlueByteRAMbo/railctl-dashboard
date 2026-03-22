import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const trainNo = searchParams.get('trainNo');

  if (!trainNo) {
    return NextResponse.json({ error: 'trainNo is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://rappid.in/apis/train.php?train_no=${trainNo.trim()}`, {
      headers: { 'User-Agent': 'RailwayDashboard/1.0' },
      next: { revalidate: 0 }
    });
    
    const text = await res.text();
    if (!text || text.trim() === '') {
      throw new Error(`Data for train ${trainNo} not found or API is down.`);
    }

    const json = JSON.parse(text);
    if (!json.success) {
      throw new Error('Failed to fetch real-time data from source.');
    }

    const rawStations = json.data || [];
    const sourceStation = rawStations[0] || {};
    const destStation = rawStations[rawStations.length - 1] || {};
    
    // Find current progress
    let currentIdx = rawStations.findIndex(s => s.is_current_station);
    
    if (currentIdx === -1 && json.message) {
      const msgLower = json.message.toLowerCase();
      // Reverse iterate to find the furthest advanced station mentioned
      for (let i = rawStations.length - 1; i >= 0; i--) {
        const sName = rawStations[i].station_name.toLowerCase();
        // Remove common suffixes to improve match rate
        const shortName = sName.replace(/ jn\.?| t\.?| cantt\.?| city/gi, '').trim();
        if (shortName.length > 2 && msgLower.includes(shortName)) {
          currentIdx = i;
          break;
        }
      }
    }
    
    if (currentIdx === -1) currentIdx = 0; // fallback to origin
    const at_src = currentIdx === 0;
    const at_dstn = currentIdx === rawStations.length - 1;
    
    let nextIdx = currentIdx + 1;
    if (nextIdx >= rawStations.length) nextIdx = rawStations.length - 1;
    const nextStation = rawStations[nextIdx] || {};

    const liveData = {
      train_number: trainNo,
      train_name: json.train_name,
      source_stn_name: sourceStation.station_name || 'Source',
      dest_stn_name: destStation.station_name || 'Destination',
      run_days: 'M T W Th F S Su',
      std: 'Dep: ' + (sourceStation.timing || '').substring(0, 5),
      journey_time: 0, // Not provided
      at_src,
      at_dstn,
      pantry_available: true,
      new_message: `${json.message} (${json.updated_time})`,
      source: sourceStation.station_name || 'Source',
      destination: destStation.station_name || 'Destination',
      next_station_code: nextStation.station_name?.substring(0, 4).toUpperCase() || '',
      next_station_name: nextStation.station_name || '',
      platform_number: nextStation.platform || '1',
      train_start_date: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({
      status: true,
      message: 'Success',
      data: liveData
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
