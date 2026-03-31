import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get wedding expense by ID from database
    return NextResponse.json({ id: params.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wedding expense' }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    // TODO: Update wedding expense in database
    return NextResponse.json({ id: params.id, ...data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update wedding expense' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Delete wedding expense from database
    return NextResponse.json({ message: 'Wedding expense deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete wedding expense' }, { status: 400 });
  }
}
