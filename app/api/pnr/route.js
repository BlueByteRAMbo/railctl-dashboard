import { NextResponse } from 'next/server';
import { checkPNRStatus } from 'irctc-connect';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pnr = searchParams.get('pnr');

  if (!pnr || pnr.length !== 10) {
    return NextResponse.json({ error: 'Valid 10-digit PNR is required' }, { status: 400 });
  }

  try {
    const result = await checkPNRStatus(pnr);
    
    // irctc-connect wraps the upstream API response, which might itself contain an error
    const d = result.data;
    if (!result.success || !d || d.success === false || d.error || result.error) {
      const errorMessage = d?.error || result.error || 'Failed to fetch real-time PNR status. The PNR may be invalid or expired.';
      throw new Error(errorMessage);
    }
    const trainInfo = d.train || {};
    const journeyInfo = d.journey || {};
    const fromStn = journeyInfo.from || {};
    const toStn = journeyInfo.to || {};

    // Map `irctc-connect` response to the existing frontend dashboard schema
    const pnrData = {
      pnrNumber: d.pnr || pnr,
      bookingStatus: d.status || 'UNKNOWN',
      trainNumber: trainInfo.number || '',
      trainName: trainInfo.name || 'Unknown Train',
      dateOfJourney: journeyInfo.date || '',
      travelClass: d.travel_class || d.class || 'N/A',
      fromStation: fromStn.name || fromStn.code || 'Source',
      toStation: toStn.name || toStn.code || 'Destination',
      boardingStation: journeyInfo.boarding?.name || fromStn.name || 'Source',
      passengerList: (d.passengers || []).map((p) => ({
        currentStatus: p.status || p.current_status || 'UNKNOWN',
        bookingStatus: p.booking_status || p.status || 'UNKNOWN',
        currentCoachId: p.coach || p.current_coach || '—',
        currentSeatNo: p.seat || p.current_seat || '—',
        currentBerthCode: p.berth || p.current_berth || '',
      })),
      chartStatus: d.chart_status || 'Unknown',
    };

    return NextResponse.json({
      status: true,
      message: 'Success',
      data: pnrData
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
