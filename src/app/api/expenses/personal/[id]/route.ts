import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get personal expense by ID from database
    return NextResponse.json({ id: params.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personal expense' }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    // TODO: Update personal expense in database
    return NextResponse.json({ id: params.id, ...data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update personal expense' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Delete personal expense from database
    return NextResponse.json({ message: 'Personal expense deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete personal expense' }, { status: 400 });
  }
}
