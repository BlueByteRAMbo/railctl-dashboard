import { NextResponse } from 'next/server';
import { searchTrainBetweenStations } from 'irctc-connect';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from')?.toUpperCase();
  const to = searchParams.get('to')?.toUpperCase();

  if (!from || !to) {
    return NextResponse.json({ error: 'from, to are required' }, { status: 400 });
  }

  try {
    // Dynamically fetch actual real data by querying every train between stations
    const result = await searchTrainBetweenStations(from, to);

    if (!result || !result.success || !result.data) {
       throw new Error(`No real-world data available between ${from} and ${to}`);
    }

    const dayMap = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']; // typical IRCTC map string '1111111'

    const mappedTrains = result.data.map(t => {
        let runDays = [];
        if (t.running_days && typeof t.running_days === 'string') {
           const daysArray = t.running_days.split('');
           daysArray.forEach((d, i) => {
              if (d === '1') runDays.push(dayMap[i] || 'Y');
           });
        }
        
        return {
           trainNumber: t.train_no,
           trainName: t.train_name,
           departureTime: t.from_time,
           arrivalTime: t.to_time,
           duration: t.travel_time?.replace(' hrs', '') || t.travel_time,
           runDays: runDays.length > 0 ? runDays : ['DAILY'],
           trainType: t.train_name?.toLowerCase().includes('rajdhani') ? 'RAJDHANI' :
                      t.train_name?.toLowerCase().includes('shatabdi') ? 'SHATABDI' :
                      t.train_name?.toLowerCase().includes('duronto') ? 'DURONTO' :
                      t.train_name?.toLowerCase().includes('vande') ? 'VANDE BHARAT' : 'EXPRESS'
        };
    });

    return NextResponse.json({
      status: true,
      message: 'Success',
      data: mappedTrains
    });

  } catch (err) {
    return NextResponse.json({ error: 'Failed to scrape real trains between stations: ' + err.message }, { status: 500 });
  }
}
