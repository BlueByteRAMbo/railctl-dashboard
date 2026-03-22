import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let trainNo = searchParams.get('trainNo') || searchParams.get('stationCode'); // station-schedule uses stationCode

  if (!trainNo) {
    return NextResponse.json({ error: 'trainNo is required' }, { status: 400 });
  }
  trainNo = trainNo.trim();

  try {
    const res = await fetch(`https://rappid.in/apis/train.php?train_no=${trainNo}`, {
      headers: { 'User-Agent': 'RailwayDashboard/1.0' },
      next: { revalidate: 0 }
    });
    
    // Sometimes it might return non-json or empty if train doesn't exist
    const text = await res.text();
    if (!text || text.trim() === '') {
      throw new Error(`Data for train ${trainNo} not found or API is down.`);
    }

    const json = JSON.parse(text);
    if (!json.success) {
      throw new Error('Failed to fetch real-time data from source.');
    }

    // Parse the unstructured rappid.in data into our dashboard's schema
    const rawStations = json.data || [];
    
    const stationsList = rawStations.map((st, i) => {
      let arr = '—';
      let dep = '—';
      if (st.timing === 'Destination' || st.timing?.includes('Destination')) {
        arr = 'Destination';
      } else if (st.timing && st.timing.length >= 10) {
        // e.g. "20:0620:00"
        arr = st.timing.substring(0, 5);
        if (st.timing.length === 10) {
           dep = st.timing.substring(5, 10);
        } else if (st.timing.length === 11) {
           // Maybe "01:0300:50"? -> 01:03 and 00:50. But sometimes it's formatted weirdly.
           arr = st.timing.substring(0, 5);
           dep = st.timing.substring(5);
        }
      }
      
      const distMatch = st.distance ? st.distance.match(/(\d+)/) : null;
      const distVal = distMatch ? parseInt(distMatch[1]) : 0;
      
      const haltMatch = st.halt ? st.halt.match(/(\d+)/) : null;
      const haltVal = haltMatch ? parseInt(haltMatch[1]) : 0;

      return {
        day: 1, // API doesn't provide day offsets easily
        serialNumber: i + 1,
        stationName: st.station_name,
        stationCode: st.station_name.substring(0, 4).toUpperCase(), // rough approximation
        arrivalTime: arr,
        departureTime: dep,
        haltTime: haltVal,
        distance: distVal,
        platform: st.platform || '—',
        is_current: st.is_current_station
      };
    });

    return NextResponse.json({
      status: true,
      message: 'Success',
      data: {
        trainNumber: trainNo,
        trainName: json.train_name,
        runDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        stationList: stationsList
      }
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
