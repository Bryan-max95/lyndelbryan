import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get('period') || '3months';
    
    let dateFilter = '';
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '3months':
      default:
        startDate.setMonth(now.getMonth() - 3);
    }

    dateFilter = `AND date >= '${startDate.toISOString().split('T')[0]}'`;

    // Total income
    const incomeResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM personal_incomes WHERE user_id IS NOT NULL ${dateFilter}`
    );
    const totalIncome = incomeResult.rows[0].total;

    // Total personal expenses
    const expensesResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM personal_expenses WHERE user_id IS NOT NULL ${dateFilter}`
    );
    const totalExpenses = expensesResult.rows[0].total;

    // Total joint expenses
    const jointResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM joint_expenses WHERE deleted_at IS NULL ${dateFilter}`
    );
    const totalJointExpenses = jointResult.rows[0].total;

    // Wedding spent
    const weddingResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM wedding_expenses ${dateFilter}`
    );
    const weddingSpent = weddingResult.rows[0].total;

    // Monthly trend
    const monthlyResult = await query(
      `SELECT 
        DATE_TRUNC('month', date)::date as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
       FROM (
         SELECT date, amount, 'income' as type FROM personal_incomes WHERE user_id IS NOT NULL ${dateFilter}
         UNION ALL
         SELECT date, amount, 'expense' as type FROM personal_expenses WHERE user_id IS NOT NULL ${dateFilter}
         UNION ALL
         SELECT created_at as date, amount, 'expense' as type FROM joint_expenses WHERE deleted_at IS NULL ${dateFilter}
       ) combined
       GROUP BY DATE_TRUNC('month', date)
       ORDER BY month DESC`
    );

    const monthlyTrend = monthlyResult.rows.map(row => ({
      month: new Date(row.month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      income: parseFloat(row.income),
      expenses: parseFloat(row.expenses)
    }));

    // Expenses by category
    const categoryExpResult = await query(
      `SELECT cat.name as category, COALESCE(SUM(pe.amount), 0) + COALESCE(SUM(je.amount), 0) as amount
       FROM categories cat
       LEFT JOIN personal_expenses pe ON pe.category_id = cat.id AND pe.date >= '${startDate.toISOString().split('T')[0]}'
       LEFT JOIN joint_expenses je ON je.category_id = cat.id AND je.deleted_at IS NULL AND je.created_at >= '${startDate.toISOString().split('T')[0]}'
       WHERE cat.type IN ('expense', 'joint')
       GROUP BY cat.name
       ORDER BY amount DESC`
    );

    const expensesByCategory = categoryExpResult.rows.map(row => ({
      category: row.category,
      amount: parseFloat(row.amount)
    }));

    // Income by category
    const categoryIncResult = await query(
      `SELECT cat.name as category, COALESCE(SUM(pi.amount), 0) as amount
       FROM categories cat
       LEFT JOIN personal_incomes pi ON pi.category_id = cat.id AND pi.date >= '${startDate.toISOString().split('T')[0]}'
       WHERE cat.type = 'income'
       GROUP BY cat.name
       ORDER BY amount DESC`
    );

    const incomeByCategory = categoryIncResult.rows.map(row => ({
      category: row.category,
      amount: parseFloat(row.amount)
    }));

    return NextResponse.json({
      totalIncome: parseFloat(totalIncome),
      totalExpenses: parseFloat(totalExpenses),
      totalJointExpenses: parseFloat(totalJointExpenses),
      weddingSpent: parseFloat(weddingSpent),
      monthlyTrend,
      expensesByCategory,
      incomeByCategory
    });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 400 });
  }
}
