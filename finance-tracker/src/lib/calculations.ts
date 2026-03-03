import type { Category, MonthlyBudget, Loan, MonthKey } from "./types"

/**
 * Calculate income/expense/savings for a single month.
 */
export function calcMonthSummary(
  budget: MonthlyBudget | undefined,
  categories: Category[]
) {
  if (!budget) return { incomeTotal: 0, expenseTotal: 0, depositTotal: 0, savings: 0 }

  let incomeTotal = 0
  let expenseTotal = 0
  let depositTotal = 0

  for (const cat of categories) {
    const entry = budget.entries[cat.id]
    if (!entry) continue
    if (cat.kind === "income") {
      incomeTotal += entry.actual
    } else if (cat.kind === "deposit") {
      depositTotal += entry.actual
    } else {
      expenseTotal += entry.actual
    }
  }

  return {
    incomeTotal,
    expenseTotal,
    depositTotal,
    savings: incomeTotal - expenseTotal - depositTotal,
  }
}

/**
 * Calculate plan vs reality diff per category for a given month.
 */
export function calcPlanVsReality(
  budget: MonthlyBudget | undefined,
  categories: Category[]
) {
  if (!budget) return []

  return categories
    .map((cat) => {
      const entry = budget.entries[cat.id]
      if (!entry) return null
      const diff = entry.actual - entry.plan
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryNameMn: cat.nameMn,
        kind: cat.kind,
        plan: entry.plan,
        actual: entry.actual,
        diff,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
}

/**
 * Build monthly time series data for charts.
 */
export function buildMonthlyTimeSeries(
  budgets: Record<MonthKey, MonthlyBudget>,
  categories: Category[],
  monthKeys: MonthKey[]
) {
  const expenseCategories = categories.filter((c) => c.kind === "expense")

  return monthKeys.map((mk) => {
    const budget = budgets[mk]
    const summary = calcMonthSummary(budget, categories)

    // Build per-category expense amounts
    const catExpenses: Record<string, number> = {}
    for (const cat of expenseCategories) {
      const entry = budget?.entries[cat.id]
      catExpenses[cat.id] = entry?.actual ?? 0
    }

    return {
      month: mk,
      income: summary.incomeTotal,
      expense: summary.expenseTotal,
      savings: summary.savings,
      ...catExpenses,
    }
  })
}

/**
 * Build cumulative savings array.
 */
export function buildCumulativeSavings(
  budgets: Record<MonthKey, MonthlyBudget>,
  categories: Category[],
  monthKeys: MonthKey[]
) {
  let cumulative = 0
  return monthKeys.map((mk) => {
    const budget = budgets[mk]
    const { savings } = calcMonthSummary(budget, categories)
    cumulative += savings
    return { month: mk, cumulativeSavings: cumulative }
  })
}

/**
 * Total remaining across all loans.
 */
export function totalLoanRemaining(loans: Loan[]): number {
  return loans.reduce((sum, l) => sum + l.remaining, 0)
}

/**
 * Get top N expense categories by actual spending, bundle rest into "Others".
 */
export function getTopExpenseCategories(
  budget: MonthlyBudget | undefined,
  categories: Category[],
  topN: number = 6
): { id: string; name: string; actual: number }[] {
  if (!budget) return []

  const expCats = categories.filter((c) => c.kind === "expense")
  const items = expCats
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      actual: budget.entries[cat.id]?.actual ?? 0,
    }))
    .sort((a, b) => b.actual - a.actual)

  if (items.length <= topN) return items

  const top = items.slice(0, topN)
  const othersTotal = items.slice(topN).reduce((s, i) => s + i.actual, 0)
  if (othersTotal > 0) {
    top.push({ id: "__others__", name: "Others", actual: othersTotal })
  }
  return top
}

/**
 * Get sorted month keys from budgets.
 */
export function getSortedMonthKeys(
  budgets: Record<MonthKey, MonthlyBudget>
): MonthKey[] {
  return Object.keys(budgets).sort()
}
