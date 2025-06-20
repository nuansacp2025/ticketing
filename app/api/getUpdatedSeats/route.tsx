import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase/firestore';
import { getSeatsQuery } from '@/lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const since = url.searchParams.get('since');

  let queryFilters = {};

  if (since) {
    const date = new Date(since);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    queryFilters = {
      lastUpdated: Timestamp.fromDate(date),
      lastUpdatedOperator: '>',
    };
  }

  try {
    const seats = await getSeatsQuery(queryFilters);
    const maxUpdatedMillis = Object.values(seats).map(seat => seat.lastUpdated?.toMillis() || 0).reduce((a, b) => Math.max(a, b), 0);
    const maxUpdatedDate = new Date(maxUpdatedMillis);
    return NextResponse.json({
      "seats": seats,
      "lastUpdated": maxUpdatedDate.toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch seats' }, { status: 500 });
  }
}