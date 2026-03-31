import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get joint expense by ID from database
    return NextResponse.json({ id: params.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch joint expense' }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    // TODO: Update joint expense in database
    return NextResponse.json({ id: params.id, ...data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update joint expense' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Delete joint expense from database
    return NextResponse.json({ message: 'Joint expense deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete joint expense' }, { status: 400 });
  }
}
