import { NextRequest, NextResponse } from 'next/server';

/**
 * ✅ Next.js 15 / 16 Route Context
 * params ahora es Promise
 */
type RouteContext = {
  params: Promise<{ id: string }>;
};

/* ======================================================
   GET - Obtener gasto conjunto
====================================================== */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // 🔹 TODO: Obtener desde DB
    return NextResponse.json({
      success: true,
      id,
      message: 'Joint expense fetched successfully'
    });

  } catch (error) {
    console.error('GET joint expense error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch joint expense' },
      { status: 400 }
    );
  }
}

/* ======================================================
   PUT - Actualizar gasto conjunto
====================================================== */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    // 🔹 TODO: Update DB
    return NextResponse.json({
      success: true,
      id,
      ...data,
      message: 'Joint expense updated successfully'
    });

  } catch (error) {
    console.error('PUT joint expense error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to update joint expense' },
      { status: 400 }
    );
  }
}

/* ======================================================
   DELETE - Eliminar gasto conjunto
====================================================== */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // 🔹 TODO: Delete DB
    return NextResponse.json({
      success: true,
      id,
      message: 'Joint expense deleted successfully'
    });

  } catch (error) {
    console.error('DELETE joint expense error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to delete joint expense' },
      { status: 400 }
    );
  }
}
