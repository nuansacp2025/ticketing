import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase/firestore';
import { getCustomersQuery } from '@/lib/db';

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
    const customers = await getCustomersQuery(queryFilters);
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch seats' }, { status: 500 });
  }
}