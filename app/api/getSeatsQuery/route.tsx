import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase/firestore';
import { getSeatsQuery } from '@/lib/db';

const OPERATOR_MAP: Record<string, any> = {
    eq: '==',
    neq: '!=',
    lt: '<',
    lte: '<=',
    gt: '>',
    gte: '>='
};

function normalizeOperator(op: string | null | undefined): any {
    if (!op) return '==';
    const mapped = OPERATOR_MAP[op];
    if (mapped) return mapped;
    const allowed = ['==', '!=', '<', '<=', '>', '>='];
    if (allowed.includes(op)) return op;
    return '==';
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;

    const filters: any = {};

    const id = params.get('id');
    if (id !== null) {
        filters.id = id;
        filters.idOperator = normalizeOperator(params.get('idOperator'));
    }

    const isAvailable = params.get('isAvailable');
    if (isAvailable !== null) {
        filters.isAvailable = isAvailable === 'true';
        filters.isAvailableOperator = normalizeOperator(params.get('isAvailableOperator'));
    }

    const reservedBy = params.get('reservedBy');
    if (reservedBy !== null) {
        filters.reservedBy = reservedBy === 'null' ? null : reservedBy;
        filters.reservedByOperator = normalizeOperator(params.get('reservedByOperator'));
    }

    const category = params.get('category');
    if (category !== null) {
        filters.category = category;
        filters.categoryOperator = normalizeOperator(params.get('categoryOperator'));
    }

    const lastUpdated = params.get('lastUpdated');
    if (lastUpdated !== null) {
        let millis: number | undefined;
        if (/^\d+$/.test(lastUpdated)) {
            millis = parseInt(lastUpdated, 10);
        } else {
            const date = new Date(lastUpdated);
            if (!isNaN(date.getTime())) millis = date.getTime();
        }
        if (millis !== undefined) {
            filters.lastUpdated = Timestamp.fromMillis(millis);
            filters.lastUpdatedOperator = normalizeOperator(params.get('lastUpdatedOperator'));
        }
    }

    try {
        const seats = await getSeatsQuery(filters);
        return NextResponse.json({ seats }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch seats' }, { status: 500 });
    }
}