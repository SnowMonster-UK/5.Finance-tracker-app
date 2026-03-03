import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { useStore } from "@/store/useStore"
import { useLocale } from "@/store/useLocale"
import { formatMNT, parseNumber } from "@/lib/format"
import { calcMonthSummary } from "@/lib/calculations"
import { getCategoryName } from "@/lib/i18n"
import { ChevronLeft, ChevronRight, Plus, Copy, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"

export function Budget() {
  const { categories, budgets, setBudgetEntry, initMonth, applyFixedTemplate, copyPreviousMonth } =
    useStore()
  const { t, locale } = useLocale()
  const [monthKey, setMonthKey] = useState(format(new Date(), "yyyy-MM"))
  const [copyMsg, setCopyMsg] = useState<string | null>(null)

  const budget = budgets[monthKey]
  const summary = calcMonthSummary(budget, categories)

  // Previous month data for comparison
  const prevMonthKey = useMemo(() => {
    const [y, m] = monthKey.split("-").map(Number)
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  }, [monthKey])
  const prevSummary = calcMonthSummary(budgets[prevMonthKey], categories)
  const hasPrevData = !!budgets[prevMonthKey]

  const incomeCategories = useMemo(
    () =>
      categories
        .filter((c) => c.kind === "income")
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [categories]
  )

  const depositCategories = useMemo(
    () =>
      categories
        .filter((c) => c.kind === "deposit")
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [categories]
  )

  const fixedExpenseCategories = useMemo(
    () =>
      categories
        .filter((c) => c.kind === "expense" && c.isFixed)
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [categories]
  )

  const variableExpenseCategories = useMemo(
    () =>
      categories
        .filter((c) => c.kind === "expense" && !c.isFixed)
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [categories]
  )

  function navigateMonth(direction: -1 | 1) {
    const [y, m] = monthKey.split("-").map(Number)
    const d = new Date(y, m - 1 + direction, 1)
    setMonthKey(format(d, "yyyy-MM"))
  }

  function handleValueChange(
    categoryId: string,
    field: "plan" | "actual",
    rawValue: string
  ) {
    const value = parseNumber(rawValue)
    setBudgetEntry(monthKey, categoryId, field, value)
  }

  function handleCopyPrevious() {
    const success = copyPreviousMonth(monthKey)
    if (success) {
      setCopyMsg(t("budget.copySuccess"))
    } else {
      setCopyMsg(t("budget.noPrevMonth"))
    }
    setTimeout(() => setCopyMsg(null), 2000)
  }

  const incomePlanTotal = incomeCategories.reduce(
    (s, c) => s + (budget?.entries[c.id]?.plan ?? 0), 0
  )
  const incomeActualTotal = incomeCategories.reduce(
    (s, c) => s + (budget?.entries[c.id]?.actual ?? 0), 0
  )
  const depositPlanTotal = depositCategories.reduce(
    (s, c) => s + (budget?.entries[c.id]?.plan ?? 0), 0
  )
  const depositActualTotal = depositCategories.reduce(
    (s, c) => s + (budget?.entries[c.id]?.actual ?? 0), 0
  )
  const fixedPlanTotal = fixedExpenseCategories.reduce(
    (s, c) => s + (budget?.entries[c.id]?.plan ?? 0), 0
  )
  const fixedActualTotal = fixedExpenseCategories.reduce(
    (s, c) => s + (budget?.entries[c.id]?.actual ?? 0), 0
  )
  const variablePlanTotal = variableExpenseCategories.reduce(
    (s, c) => s + (budget?.entries[c.id]?.plan ?? 0), 0
  )
  const variableActualTotal = variableExpenseCategories.reduce(
    (s, c) => s + (budget?.entries[c.id]?.actual ?? 0), 0
  )
  const expenseActualTotal = fixedActualTotal + variableActualTotal

  function MomIndicator({ current, previous }: { current: number; previous: number }) {
    if (!hasPrevData || previous === 0) return null
    const pct = Math.round(((current - previous) / previous) * 100)
    if (pct === 0) return <Minus className="inline h-3 w-3 text-slate-400" />
    if (pct > 0) return <span className="inline-flex items-center text-[10px] text-red-500"><TrendingUp className="mr-0.5 h-3 w-3" />+{pct}%</span>
    return <span className="inline-flex items-center text-[10px] text-green-500"><TrendingDown className="mr-0.5 h-3 w-3" />{pct}%</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">{t("budget.title")}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="month"
            value={monthKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthKey(e.target.value)}
            className="h-8 w-36 text-sm"
          />
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary with month-over-month */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="px-3 pt-3 pb-2">
            <p className="text-[10px] text-muted-foreground sm:text-xs">{t("dash.income")} ({t("budget.actual")})</p>
            <p className="text-sm font-bold text-green-600 sm:text-lg">{formatMNT(summary.incomeTotal)}</p>
            <MomIndicator current={summary.incomeTotal} previous={prevSummary.incomeTotal} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-3 pt-3 pb-2">
            <p className="text-[10px] text-muted-foreground sm:text-xs">{t("dash.expenses")} ({t("budget.actual")})</p>
            <p className="text-sm font-bold text-red-600 sm:text-lg">{formatMNT(summary.expenseTotal)}</p>
            <MomIndicator current={summary.expenseTotal} previous={prevSummary.expenseTotal} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-3 pt-3 pb-2">
            <p className="text-[10px] text-muted-foreground sm:text-xs">{t("dash.savings")}</p>
            <p className={`text-sm font-bold sm:text-lg ${summary.savings >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatMNT(summary.savings)}
            </p>
            <MomIndicator current={summary.savings} previous={prevSummary.savings} />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => initMonth(monthKey)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          {t("budget.initMonth")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyFixedTemplate(monthKey)}>
          {t("budget.applyTemplate")}
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyPrevious}>
          <Copy className="mr-1 h-3.5 w-3.5" />
          {t("budget.copyPrevMonth")}
        </Button>
        {copyMsg && (
          <span className="self-center text-xs text-muted-foreground">{copyMsg}</span>
        )}
      </div>

      {/* Income Table */}
      <Card>
        <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
          <CardTitle className="text-sm text-green-700 sm:text-base">{t("budget.income")}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <BudgetTable
            categories={incomeCategories}
            budget={budget}
            prevBudget={budgets[prevMonthKey]}
            onValueChange={handleValueChange}
            planTotal={incomePlanTotal}
            actualTotal={incomeActualTotal}
            kind="income"
            t={t}
            locale={locale}
            hasPrevData={hasPrevData}
          />
        </CardContent>
      </Card>

      {/* Deposit Table */}
      <Card>
        <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
          <CardTitle className="text-sm text-blue-700 sm:text-base">{t("budget.deposit")}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <BudgetTable
            categories={depositCategories}
            budget={budget}
            prevBudget={budgets[prevMonthKey]}
            onValueChange={handleValueChange}
            planTotal={depositPlanTotal}
            actualTotal={depositActualTotal}
            kind="deposit"
            t={t}
            locale={locale}
            hasPrevData={hasPrevData}
          />
        </CardContent>
      </Card>

      {/* Expenses 1 (Fixed) */}
      <Card>
        <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
          <CardTitle className="text-sm text-red-700 sm:text-base">{t("budget.expenseFixed")}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <BudgetTable
            categories={fixedExpenseCategories}
            budget={budget}
            prevBudget={budgets[prevMonthKey]}
            onValueChange={handleValueChange}
            planTotal={fixedPlanTotal}
            actualTotal={fixedActualTotal}
            kind="expense"
            t={t}
            locale={locale}
            hasPrevData={hasPrevData}
          />
        </CardContent>
      </Card>

      {/* Expenses 2 (Variable) */}
      <Card>
        <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
          <CardTitle className="text-sm text-red-700 sm:text-base">{t("budget.expenseVariable")}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <BudgetTable
            categories={variableExpenseCategories}
            budget={budget}
            prevBudget={budgets[prevMonthKey]}
            onValueChange={handleValueChange}
            planTotal={variablePlanTotal}
            actualTotal={variableActualTotal}
            kind="expense"
            t={t}
            locale={locale}
            hasPrevData={hasPrevData}
          />
        </CardContent>
      </Card>

      {/* Expenses Total */}
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
        <CardContent className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-bold text-red-700 dark:text-red-400">{t("budget.expenseTotal")}</span>
          <span className="text-sm font-bold text-red-700 dark:text-red-400">{formatMNT(expenseActualTotal)}</span>
        </CardContent>
      </Card>
    </div>
  )
}

function BudgetTable({
  categories,
  budget,
  prevBudget,
  onValueChange,
  planTotal,
  actualTotal,
  kind,
  t,
  locale,
  hasPrevData,
}: {
  categories: { id: string; name: string; nameMn?: string; isFixed?: boolean }[]
  budget: ReturnType<typeof useStore.getState>["budgets"][string] | undefined
  prevBudget: ReturnType<typeof useStore.getState>["budgets"][string] | undefined
  onValueChange: (catId: string, field: "plan" | "actual", val: string) => void
  planTotal: number
  actualTotal: number
  kind: "income" | "expense" | "deposit"
  t: (key: any) => string
  locale: string
  hasPrevData: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[72px] text-xs sm:w-[180px]">{t("budget.category")}</TableHead>
            <TableHead className="px-1 text-right text-xs sm:px-3">{t("budget.plan")}</TableHead>
            <TableHead className="px-1 text-right text-xs sm:px-3">{t("budget.reality")}</TableHead>
            <TableHead className="px-1 text-right text-xs sm:px-3">{t("budget.diff")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => {
            const entry = budget?.entries[cat.id]
            const plan = entry?.plan ?? 0
            const actual = entry?.actual ?? 0
            const diff = actual - plan
            const isOverBudget = kind === "expense" ? diff > 0 && plan > 0 : false
            const prevActual = prevBudget?.entries[cat.id]?.actual ?? 0

            return (
              <TableRow key={cat.id} className={isOverBudget ? "bg-red-50 dark:bg-red-950/20" : ""}>
                <TableCell className="py-1 pr-0 text-xs font-medium sm:pr-3 sm:text-sm">
                  <div className="flex items-center gap-1">
                    <span className="truncate">{getCategoryName(cat, locale as any)}</span>
                    {isOverBudget && (
                      <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                    )}
                  </div>
                  {hasPrevData && prevActual > 0 && (
                    <span className="block truncate text-[9px] text-muted-foreground">
                      {t("budget.vsLastMonth")}: {formatMNT(prevActual)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-1 py-1 text-right sm:px-3">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={plan || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onValueChange(cat.id, "plan", e.target.value)}
                    className="ml-auto h-7 w-[68px] text-right text-[11px] sm:w-32 sm:text-sm"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell className="px-1 py-1 text-right sm:px-3">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={actual || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onValueChange(cat.id, "actual", e.target.value)}
                    className={`ml-auto h-7 w-[68px] text-right text-[11px] sm:w-32 sm:text-sm ${isOverBudget ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30" : ""}`}
                    placeholder="0"
                  />
                </TableCell>
                <TableCell
                  className={`whitespace-nowrap px-1 py-1 text-right text-[10px] font-medium sm:px-3 sm:text-sm ${
                    kind === "expense"
                      ? diff > 0 ? "text-red-600" : diff < 0 ? "text-green-600" : ""
                      : diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : ""
                  }`}
                >
                  {formatMNT(diff)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="text-xs font-bold sm:text-sm">{t("budget.total")}</TableCell>
            <TableCell className="px-1 text-right text-xs font-bold sm:px-3 sm:text-sm">{formatMNT(planTotal)}</TableCell>
            <TableCell className="px-1 text-right text-xs font-bold sm:px-3 sm:text-sm">{formatMNT(actualTotal)}</TableCell>
            <TableCell
              className={`whitespace-nowrap px-1 text-right text-[10px] font-bold sm:px-3 sm:text-sm ${
                kind === "expense"
                  ? actualTotal - planTotal > 0 ? "text-red-600" : actualTotal - planTotal < 0 ? "text-green-600" : ""
                  : actualTotal - planTotal > 0 ? "text-green-600" : actualTotal - planTotal < 0 ? "text-red-600" : ""
              }`}
            >
              {formatMNT(actualTotal - planTotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
