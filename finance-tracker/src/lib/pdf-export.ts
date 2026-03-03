import type { Category, MonthlyBudget, Loan, Goal, MonthKey } from "./types"
import type { Locale, TranslationKey } from "./i18n"
import { getCategoryName } from "./i18n"
import { formatMNT } from "./format"
import { calcMonthSummary, getSortedMonthKeys, totalLoanRemaining } from "./calculations"

interface PdfExportParams {
  categories: Category[]
  budgets: Record<MonthKey, MonthlyBudget>
  loans: Loan[]
  goals: Goal[]
  locale: Locale
  t: (key: TranslationKey) => string
}

export function generatePdf({
  categories,
  budgets,
  loans,
  goals,
  locale,
  t,
}: PdfExportParams) {
  const sortedMonths = getSortedMonthKeys(budgets)
  const incomeCategories = categories.filter((c) => c.kind === "income")
  const expenseCategories = categories.filter((c) => c.kind === "expense")
  const loanTotal = totalLoanRemaining(loans)

  const title = t("app.title")
  const now = new Date().toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 11px; color: #1e293b; padding: 20px; }
  h1 { font-size: 18px; margin-bottom: 4px; color: #4f46e5; }
  h2 { font-size: 14px; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #e2e8f0; color: #334155; }
  .date { font-size: 10px; color: #94a3b8; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
  th, td { border: 1px solid #e2e8f0; padding: 4px 6px; text-align: left; }
  th { background: #f8fafc; font-weight: 600; color: #475569; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .total-row { font-weight: 700; background: #f1f5f9; }
  .positive { color: #059669; }
  .negative { color: #dc2626; }
  .section { page-break-inside: avoid; }
  @media print { body { padding: 10px; } }
</style></head><body>`

  html += `<h1>${title}</h1><p class="date">${now}</p>`

  // ── Monthly Budgets ──
  if (sortedMonths.length > 0) {
    html += `<h2>${t("budget.title")}</h2>`

    for (const mk of sortedMonths) {
      const budget = budgets[mk]
      const summary = calcMonthSummary(budget, categories)

      html += `<div class="section"><h3 style="font-size:12px;margin:10px 0 4px;color:#6366f1;">${mk}</h3>`
      html += `<table><thead><tr><th>${t("budget.category")}</th><th class="num">${t("budget.plan")}</th><th class="num">${t("budget.reality")}</th><th class="num">${t("budget.diff")}</th></tr></thead><tbody>`

      // Income
      let incomePlanTotal = 0
      let incomeActualTotal = 0
      for (const cat of incomeCategories) {
        const entry = budget?.entries[cat.id]
        if (!entry) continue
        const diff = entry.actual - entry.plan
        incomePlanTotal += entry.plan
        incomeActualTotal += entry.actual
        const cls = diff >= 0 ? "positive" : "negative"
        html += `<tr><td>${getCategoryName(cat, locale)}</td><td class="num">${formatMNT(entry.plan)}</td><td class="num">${formatMNT(entry.actual)}</td><td class="num ${cls}">${formatMNT(diff)}</td></tr>`
      }
      html += `<tr class="total-row"><td>${t("budget.income")} ${t("budget.total")}</td><td class="num">${formatMNT(incomePlanTotal)}</td><td class="num">${formatMNT(incomeActualTotal)}</td><td class="num">${formatMNT(incomeActualTotal - incomePlanTotal)}</td></tr>`

      // Expense
      let expensePlanTotal = 0
      let expenseActualTotal = 0
      for (const cat of expenseCategories) {
        const entry = budget?.entries[cat.id]
        if (!entry) continue
        const diff = entry.actual - entry.plan
        expensePlanTotal += entry.plan
        expenseActualTotal += entry.actual
        const cls = diff <= 0 ? "positive" : "negative"
        html += `<tr><td>${getCategoryName(cat, locale)}</td><td class="num">${formatMNT(entry.plan)}</td><td class="num">${formatMNT(entry.actual)}</td><td class="num ${cls}">${formatMNT(diff)}</td></tr>`
      }
      html += `<tr class="total-row"><td>${t("budget.expense")} ${t("budget.total")}</td><td class="num">${formatMNT(expensePlanTotal)}</td><td class="num">${formatMNT(expenseActualTotal)}</td><td class="num">${formatMNT(expenseActualTotal - expensePlanTotal)}</td></tr>`

      // Savings
      const savingsClass = summary.savings >= 0 ? "positive" : "negative"
      html += `<tr class="total-row"><td>${t("dash.savings")}</td><td class="num">${formatMNT(incomePlanTotal - expensePlanTotal)}</td><td class="num ${savingsClass}">${formatMNT(summary.savings)}</td><td class="num"></td></tr>`

      html += `</tbody></table></div>`
    }
  }

  // ── Loans ──
  if (loans.length > 0) {
    html += `<div class="section"><h2>${t("loans.title")}</h2>`
    html += `<table><thead><tr><th>${t("loans.name")}</th><th class="num">${t("loans.principal")}</th><th class="num">${t("loans.remaining")}</th><th class="num">${t("loans.rate")}</th><th class="num">${t("loans.monthly")}</th></tr></thead><tbody>`

    for (const loan of loans) {
      html += `<tr><td>${loan.name}</td><td class="num">${formatMNT(loan.principal)}</td><td class="num">${formatMNT(loan.remaining)}</td><td class="num">${loan.rate}%</td><td class="num">${formatMNT(loan.monthlyPayment ?? 0)}</td></tr>`
    }

    html += `<tr class="total-row"><td>${t("loans.total")}</td><td class="num"></td><td class="num">${formatMNT(loanTotal)}</td><td class="num"></td><td class="num">${formatMNT(loans.reduce((s, l) => s + (l.monthlyPayment ?? 0), 0))}</td></tr>`
    html += `</tbody></table></div>`
  }

  // ── Goals ──
  if (goals.length > 0) {
    html += `<div class="section"><h2>${t("goals.title")}</h2>`
    html += `<table><thead><tr><th>${t("goals.name")}</th><th>${t("goals.scope")}</th><th>${t("goals.type")}</th><th class="num">${t("goals.targetAmount")}</th><th class="num">${t("goals.currentAmount")}</th><th class="num">${t("loans.progress")}</th></tr></thead><tbody>`

    for (const goal of goals) {
      const pct = goal.targetAmount > 0
        ? Math.round(((goal.currentAmount ?? 0) / goal.targetAmount) * 100)
        : 0
      html += `<tr><td>${goal.name}</td><td>${goal.scope}</td><td>${goal.type}</td><td class="num">${formatMNT(goal.targetAmount)}</td><td class="num">${formatMNT(goal.currentAmount ?? 0)}</td><td class="num">${pct}%</td></tr>`
    }

    html += `</tbody></table></div>`
  }

  html += `</body></html>`

  // Open in new window and trigger print
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
  }
}
