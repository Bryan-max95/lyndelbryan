import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
  }

  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Total balance
    const totalIncomes = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM personal_incomes'
    );
    const totalExpenses = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM personal_expenses
       UNION ALL
       SELECT COALESCE(SUM(amount), 0) FROM joint_expenses WHERE deleted_at IS NULL`
    );
    
    const totalExpensesSum = (totalExpenses.rows[0]?.total || 0) + (totalExpenses.rows[1]?.total || 0);
    const totalBalance = totalIncomes.rows[0].total - totalExpensesSum;

    // Monthly income
    const monthlyIncome = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM personal_incomes
       WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2`,
      [currentYear, currentMonth]
    );

    // Monthly expense
    const monthlyExpensePersonal = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM personal_expenses
       WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2`,
      [currentYear, currentMonth]
    );
    
    const monthlyExpenseJoint = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM joint_expenses
       WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2 AND deleted_at IS NULL`,
      [currentYear, currentMonth]
    );
    
    const monthlyExpense = monthlyExpensePersonal.rows[0].total + monthlyExpenseJoint.rows[0].total;

    // Wedding progress
    const weddingBudget = await query('SELECT total_budget FROM wedding_budget LIMIT 1');
    const weddingSpent = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM wedding_expenses'
    );
    
    let weddingProgress = 0;
    if (weddingBudget.rows[0]?.total_budget > 0) {
      weddingProgress = (weddingSpent.rows[0].total / weddingBudget.rows[0].total_budget) * 100;
    }

    // Recent movements
    const recentMovements = await query(`
      (SELECT 
        'Ingreso Personal' as type,
        p.amount,
        p.date,
        u.username,
        c.name as category
      FROM personal_incomes p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      LIMIT 5)
      UNION ALL
      (SELECT 
        'Gasto Personal' as type,
        p.amount,
        p.date,
        u.username,
        c.name as category
      FROM personal_expenses p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      LIMIT 5)
      UNION ALL
      (SELECT 
        'Gasto Conjunto' as type,
        j.amount,
        j.date,
        u.username,
        c.name as category
      FROM joint_expenses j
      JOIN users u ON j.created_by = u.id
      JOIN categories c ON j.category_id = c.id
      WHERE j.deleted_at IS NULL
      LIMIT 5)
      ORDER BY date DESC
      LIMIT 10
    `);

    return NextResponse.json({
      total_balance: totalBalance,
      monthly_income: monthlyIncome.rows[0].total,
      monthly_expense: monthlyExpense,
      available_money: monthlyIncome.rows[0].total - monthlyExpense,
      accumulated_savings: totalBalance,
      personal_expenses_month: monthlyExpensePersonal.rows[0].total,
      joint_expenses_month: monthlyExpenseJoint.rows[0].total,
      wedding_progress: weddingProgress,
      recent_movements: recentMovements.rows,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ message: 'Error al cargar dashboard' }, { status: 500 });
  }
}
