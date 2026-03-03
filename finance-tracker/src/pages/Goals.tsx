import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useStore } from "@/store/useStore"
import { useLocale } from "@/store/useLocale"
import { formatMNT } from "@/lib/format"
import { calcMonthSummary, buildCumulativeSavings, getSortedMonthKeys, totalLoanRemaining } from "@/lib/calculations"
import type { Goal } from "@/lib/types"
import { Plus, Pencil, Trash2, Target, Zap } from "lucide-react"

const emptyGoal: Omit<Goal, "id"> = {
  scope: "monthly",
  name: "",
  type: "savings",
  targetAmount: 0,
  targetDate: undefined,
  relatedLoanId: undefined,
  currentAmount: 0,
  notes: "",
}

const scopeColors: Record<string, string> = {
  monthly: "bg-blue-100 text-blue-800",
  yearly: "bg-purple-100 text-purple-800",
  "2030": "bg-orange-100 text-orange-800",
}

export function Goals() {
  const { goals, addGoal, updateGoal, removeGoal, budgets, categories, loans } = useStore()
  const { t } = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyGoal)

  // Auto-calculated values
  const currentMonth = format(new Date(), "yyyy-MM")
  const sortedMonths = useMemo(() => getSortedMonthKeys(budgets), [budgets])
  const currentSummary = calcMonthSummary(budgets[currentMonth], categories)
  const cumulSavings = useMemo(
    () => buildCumulativeSavings(budgets, categories, sortedMonths),
    [budgets, categories, sortedMonths]
  )
  const totalCumulSavings = cumulSavings.length > 0 ? cumulSavings[cumulSavings.length - 1].cumulativeSavings : 0
  const loanTotal = totalLoanRemaining(loans)

  function getAutoCurrentAmount(goal: Goal): number | null {
    switch (goal.type) {
      case "savings":
        return totalCumulSavings
      case "expenseCap":
        return currentSummary.expenseTotal
      case "loanBalance":
        if (goal.relatedLoanId) {
          const loan = loans.find((l) => l.id === goal.relatedLoanId)
          return loan ? loan.principal - loan.remaining : null
        }
        return loanTotal > 0 ? loans.reduce((s, l) => s + l.principal, 0) - loanTotal : null
      default:
        return null
    }
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyGoal)
    setDialogOpen(true)
  }

  function openEdit(goal: Goal) {
    setEditingId(goal.id)
    setForm({
      scope: goal.scope,
      name: goal.name,
      type: goal.type,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
      relatedLoanId: goal.relatedLoanId,
      currentAmount: goal.currentAmount,
      notes: goal.notes,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.name) return
    if (editingId) {
      updateGoal(editingId, form)
    } else {
      addGoal({ ...form, id: `goal-${Date.now()}` })
    }
    setDialogOpen(false)
  }

  function setField(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const grouped = {
    monthly: goals.filter((g) => g.scope === "monthly"),
    yearly: goals.filter((g) => g.scope === "yearly"),
    "2030": goals.filter((g) => g.scope === "2030"),
  }

  const scopeLabels = {
    monthly: t("goals.monthly"),
    yearly: t("goals.yearly"),
    "2030": t("goals.2030"),
  }

  const typeLabels = {
    savings: t("goals.savings"),
    expenseCap: t("goals.expenseCap"),
    loanBalance: t("goals.loanBalance"),
    personal: t("goals.personal"),
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">{t("goals.title")}</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" />
              {t("goals.addGoal")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? t("goals.editGoal") : t("goals.addGoal")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div>
                <Label className="text-xs">{t("goals.name")} *</Label>
                <Input
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("goals.scope")}</Label>
                  <Select value={form.scope} onValueChange={(v: string) => setField("scope", v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t("goals.monthly")}</SelectItem>
                      <SelectItem value="yearly">{t("goals.yearly")}</SelectItem>
                      <SelectItem value="2030">{t("goals.2030")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t("goals.type")}</Label>
                  <Select value={form.type} onValueChange={(v: string) => setField("type", v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">{t("goals.savings")}</SelectItem>
                      <SelectItem value="expenseCap">{t("goals.expenseCap")}</SelectItem>
                      <SelectItem value="loanBalance">{t("goals.loanBalance")}</SelectItem>
                      <SelectItem value="personal">{t("goals.personal")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("goals.targetAmount")}</Label>
                  <Input
                    type="number"
                    value={form.targetAmount || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("targetAmount", Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("goals.currentAmount")}</Label>
                  <Input
                    type="number"
                    value={form.currentAmount ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setField("currentAmount", e.target.value ? Number(e.target.value) : 0)
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">{t("goals.targetDate")}</Label>
                <Input
                  type="date"
                  value={form.targetDate ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setField("targetDate", e.target.value || undefined)
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">{t("goals.notes")}</Label>
                <Input
                  value={form.notes ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("notes", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" size="sm">{t("common.cancel")}</Button>
              </DialogClose>
              <Button size="sm" onClick={handleSave}>{t("common.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t("goals.noGoals")}
          </CardContent>
        </Card>
      )}

      {(["monthly", "yearly", "2030"] as const).map((scope) => {
        const items = grouped[scope]
        if (items.length === 0) return null
        return (
          <Card key={scope}>
            <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
              <CardTitle className="text-sm sm:text-base">
                {scopeLabels[scope]} {t("goals.goalsLabel")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-2">
                {items.map((goal) => {
                  const autoAmount = getAutoCurrentAmount(goal)
                  const currentAmt = autoAmount !== null ? autoAmount : (goal.currentAmount ?? 0)
                  const progress =
                    goal.targetAmount > 0
                      ? Math.min(100, Math.round((currentAmt / goal.targetAmount) * 100))
                      : 0
                  const isAutoTracked = autoAmount !== null
                  const hasAmounts = goal.targetAmount > 0
                  return (
                    <div key={goal.id} className="flex items-center gap-3 rounded-lg border p-2 sm:gap-4 sm:p-3">
                      <Target className="hidden h-5 w-5 text-muted-foreground sm:block" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-medium sm:text-sm">{goal.name}</span>
                          <Badge variant="secondary" className={`text-[10px] ${scopeColors[goal.scope]}`}>
                            {typeLabels[goal.type as keyof typeof typeLabels]}
                          </Badge>
                          {isAutoTracked && (
                            <Zap className="h-3 w-3 text-amber-500" title="Auto-tracked" />
                          )}
                        </div>
                        {hasAmounts && (
                          <>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded-full bg-muted">
                                <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-xs font-medium">{progress}%</span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                              {formatMNT(currentAmt)} / {formatMNT(goal.targetAmount)}
                              {goal.targetDate && ` — ${t("common.by")} ${goal.targetDate}`}
                            </p>
                          </>
                        )}
                        {!hasAmounts && goal.targetDate && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                            {t("common.by")} {goal.targetDate}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(goal)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeGoal(goal.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
