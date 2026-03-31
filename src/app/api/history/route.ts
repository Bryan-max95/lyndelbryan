import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT al.*, u.username
       FROM audit_logs al
       JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC
       LIMIT 1000`
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 400 });
  }
}
