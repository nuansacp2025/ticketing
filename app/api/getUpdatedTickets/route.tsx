import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase/firestore';
import { getTicketsQuery } from '@/lib/db';
import { ApiError } from '@/lib/error';

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
    const tickets = await getTicketsQuery(queryFilters);
    const maxUpdatedMillis = Object.values(tickets).map(ticket => ticket.lastUpdated?.toMillis() || 0).reduce((a, b) => Math.max(a, b), 0);
    const maxUpdatedDate = new Date(maxUpdatedMillis);
    return NextResponse.json({
      "tickets": tickets,
      "lastUpdated": maxUpdatedDate.toISOString()
    });
  } catch (error) {
    if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}