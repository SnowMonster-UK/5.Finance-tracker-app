import { useMemo } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/store/useStore"
import { useLocale } from "@/store/useLocale"
import { getCategoryName } from "@/lib/i18n"
import { formatMNT, formatMNTShort } from "@/lib/format"
import {
  calcMonthSummary,
  calcPlanVsReality,
  getSortedMonthKeys,
  totalLoanRemaining,
  buildCumulativeSavings,
} from "@/lib/calculations"
import {
  EXPENSE_COLORS,
  INCOME_LINE_COLOR,
  SAVINGS_LINE_COLOR,
  LOAN_LINE_COLOR,
  NET_LINE_COLOR,
  CUMULATIVE_SAVINGS_COLOR,
  POSITIVE_COLOR,
  NEGATIVE_COLOR,
} from "@/lib/chart-colors"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Wallet, Landmark, Target, PiggyBank } from "lucide-react"

const currentMonth = format(new Date(), "yyyy-MM")

export function Dashboard() {
  const { categories, budgets, loans, goals } = useStore()
  const { t, locale } = useLocale()
  const sortedMonths = useMemo(() => getSortedMonthKeys(budgets), [budgets])

  const currentBudget = budgets[currentMonth]
  const currentSummary = calcMonthSummary(currentBudget, categories)
  const loanTotal = totalLoanRemaining(loans)

  // Accumulated deposits (all deposit-kind categories)
  const depositsTotal = useMemo(() => {
    const depCats = categories.filter((c) => c.kind === "deposit")
    if (depCats.length === 0) return 0
    return sortedMonths.reduce((sum, mk) => {
      let monthSum = 0
      for (const cat of depCats) {
        const entry = budgets[mk]?.entries[cat.id]
        monthSum += entry?.actual ?? 0
      }
      return sum + monthSum
    }, 0)
  }, [categories, budgets, sortedMonths])

  const goalProgress = useMemo(() => {
    if (goals.length === 0) return 0
    const achieved = goals.filter(
      (g) => (g.currentAmount ?? 0) >= g.targetAmount
    ).length
    return Math.round((achieved / goals.length) * 100)
  }, [goals])

  const expenseCategories = useMemo(
    () =>
      categories
        .filter((c) => c.kind === "expense")
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [categories]
  )

  const cashflowData = useMemo(() => {
    return sortedMonths.map((mk) => {
      const budget = budgets[mk]
      const summary = calcMonthSummary(budget, categories)
      const row: Record<string, unknown> = {
        month: mk.slice(5),
        monthFull: mk,
        income: summary.incomeTotal,
        savings: summary.savings,
      }
      const catAmounts: { id: string; name: string; val: number }[] = []
      for (const cat of expenseCategories) {
        const val = budget?.entries[cat.id]?.actual ?? 0
        catAmounts.push({ id: cat.id, name: getCategoryName(cat, locale), val })
      }
      catAmounts.sort((a, b) => b.val - a.val)
      const top = catAmounts.slice(0, 6)
      const othersVal = catAmounts.slice(6).reduce((s, c) => s + c.val, 0)
      for (const item of top) {
        row[item.name] = item.val
      }
      if (othersVal > 0) {
        row[t("common.others")] = othersVal
      }
      return row
    })
  }, [sortedMonths, budgets, categories, expenseCategories, t, locale])

  const stackKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const row of cashflowData) {
      for (const k of Object.keys(row)) {
        if (!["month", "monthFull", "income", "savings"].includes(k)) {
          keys.add(k)
        }
      }
    }
    return Array.from(keys)
  }, [cashflowData])

  const pvr = useMemo(() => {
    const raw = calcPlanVsReality(currentBudget, categories)
      .filter((d) => d.kind === "expense" && (d.plan !== 0 || d.actual !== 0))
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

    // Localize categoryName
    const data = raw.map((d) => ({
      ...d,
      categoryName: getCategoryName({ name: d.categoryName, nameMn: d.categoryNameMn }, locale),
    }))

    if (data.length <= 8) return data
    const top = data.slice(0, 7)
    const othersDiff = data.slice(7).reduce((s, d) => s + d.diff, 0)
    const othersPlan = data.slice(7).reduce((s, d) => s + d.plan, 0)
    const othersActual = data.slice(7).reduce((s, d) => s + d.actual, 0)
    top.push({
      ...data[0],
      categoryId: "__others__",
      categoryName: t("common.others"),
      categoryNameMn: undefined,
      kind: "expense",
      plan: othersPlan,
      actual: othersActual,
      diff: othersDiff,
    })
    return top
  }, [currentBudget, categories, t, locale])

  const loanLabel = t("dash.loanBalanceLine")
  const savingsLabel = t("dash.cumulativeSavings")
  const netLabel = t("dash.net")

  const debtAssetData = useMemo(() => {
    const cumulSavings = buildCumulativeSavings(budgets, categories, sortedMonths)
    return sortedMonths.map((mk, i) => ({
      month: mk.slice(5),
      monthFull: mk,
      [loanLabel]: loanTotal,
      [savingsLabel]: cumulSavings[i]?.cumulativeSavings ?? 0,
      [netLabel]: (cumulSavings[i]?.cumulativeSavings ?? 0) - loanTotal,
    }))
  }, [sortedMonths, budgets, categories, loanTotal, loanLabel, savingsLabel, netLabel])

  const hasData = sortedMonths.length > 0

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-xl font-bold sm:text-2xl">{t("dash.title")}</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-6">
        <KpiCard
          title={t("dash.income")}
          value={formatMNT(currentSummary.incomeTotal)}
          icon={<TrendingUp className="h-4 w-4" />}
          subtitle={currentMonth}
          gradient="from-emerald-500 to-teal-600"
        />
        <KpiCard
          title={t("dash.expenses")}
          value={formatMNT(currentSummary.expenseTotal)}
          icon={<TrendingDown className="h-4 w-4" />}
          subtitle={currentMonth}
          gradient="from-rose-500 to-pink-600"
        />
        <KpiCard
          title={t("dash.savings")}
          value={formatMNT(currentSummary.savings)}
          icon={<Wallet className="h-4 w-4" />}
          subtitle={currentSummary.savings >= 0 ? t("dash.surplus") : t("dash.deficit")}
          gradient={currentSummary.savings >= 0 ? "from-blue-500 to-cyan-600" : "from-red-500 to-orange-600"}
        />
        <KpiCard
          title={t("dash.loanBalance")}
          value={formatMNT(loanTotal)}
          icon={<Landmark className="h-4 w-4" />}
          subtitle={`${loans.length} ${t("dash.loans")}`}
          gradient="from-orange-500 to-amber-600"
        />
        <KpiCard
          title={t("dash.goals")}
          value={`${goalProgress}%`}
          icon={<Target className="h-4 w-4" />}
          subtitle={`${goals.length} ${t("dash.goalsCount")}`}
          gradient="from-violet-500 to-purple-600"
        />
        <KpiCard
          title={t("dash.deposits")}
          value={formatMNT(depositsTotal)}
          icon={<PiggyBank className="h-4 w-4" />}
          subtitle={t("dash.depositsTotal")}
          gradient="from-cyan-500 to-sky-600"
        />
      </div>

      {!hasData && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t("dash.noData")}
          </CardContent>
        </Card>
      )}

      {hasData && (
        <>
          {/* Chart A */}
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 sm:px-6 sm:py-3">
              <CardTitle className="text-sm font-semibold text-blue-800 sm:text-base">{t("dash.chartA")}</CardTitle>
            </CardHeader>
            <CardContent className="px-1 sm:px-6">
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={cashflowData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis tickFormatter={formatMNTShort} fontSize={10} width={55} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {stackKeys.map((key, i) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="expense"
                      fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke={INCOME_LINE_COLOR}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={t("dash.income")}
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke={SAVINGS_LINE_COLOR}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={t("dash.savings")}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart B */}
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 sm:px-6 sm:py-3">
              <CardTitle className="text-sm font-semibold text-amber-800 sm:text-base">
                {t("dash.chartB")} — {currentMonth}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-1 sm:px-6">
              {pvr.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">—</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(180, pvr.length * 36)}>
                  <BarChart data={pvr} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" tickFormatter={formatMNTShort} fontSize={10} />
                    <YAxis type="category" dataKey="categoryName" width={100} fontSize={11} />
                    <Bar dataKey="diff" name={t("budget.diff")}>
                      {pvr.map((entry, index) => (
                        <Cell key={index} fill={entry.diff > 0 ? NEGATIVE_COLOR : POSITIVE_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart C */}
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-2 sm:px-6 sm:py-3">
              <CardTitle className="text-sm font-semibold text-violet-800 sm:text-base">{t("dash.chartC")}</CardTitle>
            </CardHeader>
            <CardContent className="px-1 sm:px-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={debtAssetData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis tickFormatter={formatMNTShort} fontSize={10} width={55} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey={loanLabel}
                    stroke={LOAN_LINE_COLOR}
                    fill={LOAN_LINE_COLOR}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey={savingsLabel}
                    stroke={CUMULATIVE_SAVINGS_COLOR}
                    fill={CUMULATIVE_SAVINGS_COLOR}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey={netLabel}
                    stroke={NET_LINE_COLOR}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function KpiCard({
  title,
  value,
  icon,
  subtitle,
  gradient,
}: {
  title: string
  value: string
  icon: React.ReactNode
  subtitle: string
  gradient: string
  valueClass?: string
}) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${gradient} p-[1px] shadow-md`}>
      <div className="rounded-[11px] bg-white px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-500 sm:text-xs">{title}</span>
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white`}>
            {icon}
          </div>
        </div>
        <p className="mt-0.5 text-sm font-extrabold text-slate-800 sm:text-xl">{value}</p>
        <p className="text-[10px] text-slate-400 sm:text-xs">{subtitle}</p>
      </div>
    </div>
  )
}
