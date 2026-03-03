import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { formatMNT } from "@/lib/format"
import { totalLoanRemaining } from "@/lib/calculations"
import { getCategoryName } from "@/lib/i18n"
import type { Loan } from "@/lib/types"
import { Plus, Pencil, Trash2, CalendarClock, Link } from "lucide-react"

const emptyLoan: Omit<Loan, "id"> = {
  name: "",
  principal: 0,
  rate: undefined,
  termMonths: undefined,
  startDate: undefined,
  endDate: undefined,
  monthlyPayment: undefined,
  paidTotal: undefined,
  remaining: 0,
  relatedCategoryId: undefined,
  notes: "",
}

interface AmortRow {
  month: number
  payment: number
  interest: number
  principalPart: number
  balance: number
}

function buildAmortizationSchedule(principal: number, rate: number, termMonths: number): AmortRow[] {
  if (principal <= 0 || rate <= 0 || termMonths <= 0) return []
  const monthlyRate = rate / 100 / 12
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)

  const rows: AmortRow[] = []
  let balance = principal
  for (let i = 1; i <= termMonths && balance > 0; i++) {
    const interest = balance * monthlyRate
    const principalPart = Math.min(payment - interest, balance)
    balance = Math.max(0, balance - principalPart)
    rows.push({
      month: i,
      payment: Math.round(payment),
      interest: Math.round(interest),
      principalPart: Math.round(principalPart),
      balance: Math.round(balance),
    })
  }
  return rows
}

export function Loans() {
  const { loans, addLoan, updateLoan, removeLoan, categories, budgets } = useStore()
  const { t, locale } = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyLoan)
  const [scheduleId, setScheduleId] = useState<string | null>(null)

  const total = totalLoanRemaining(loans)
  const totalPrincipal = loans.reduce((s, l) => s + l.principal, 0)

  const expenseCategories = useMemo(
    () => categories
      .filter((c) => c.kind === "expense")
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [categories]
  )

  // Calculate paid from budget for each loan
  function getPaidFromBudget(loan: Loan): number {
    if (!loan.relatedCategoryId) return 0
    let total = 0
    for (const mk of Object.keys(budgets)) {
      const entry = budgets[mk]?.entries[loan.relatedCategoryId]
      if (entry) total += entry.actual
    }
    return total
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyLoan)
    setDialogOpen(true)
  }

  function openEdit(loan: Loan) {
    setEditingId(loan.id)
    setForm({
      name: loan.name,
      principal: loan.principal,
      rate: loan.rate,
      termMonths: loan.termMonths,
      startDate: loan.startDate,
      endDate: loan.endDate,
      monthlyPayment: loan.monthlyPayment,
      paidTotal: loan.paidTotal,
      remaining: loan.remaining,
      relatedCategoryId: loan.relatedCategoryId,
      notes: loan.notes,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.name) return
    if (editingId) {
      updateLoan(editingId, form)
    } else {
      addLoan({ ...form, id: `loan-${Date.now()}` })
    }
    setDialogOpen(false)
  }

  function setField(field: string, value: string | number | undefined) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const scheduleLoan = scheduleId ? loans.find((l) => l.id === scheduleId) : null
  const scheduleRows = scheduleLoan && scheduleLoan.rate && scheduleLoan.termMonths
    ? buildAmortizationSchedule(scheduleLoan.principal, scheduleLoan.rate, scheduleLoan.termMonths)
    : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">{t("loans.title")}</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" />
              {t("loans.addLoan")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? t("loans.editLoan") : t("loans.addLoan")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div>
                <Label className="text-xs">{t("loans.name")} *</Label>
                <Input
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("loans.principal")}</Label>
                  <Input
                    type="number"
                    value={form.principal || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("principal", Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("loans.remaining")} *</Label>
                  <Input
                    type="number"
                    value={form.remaining || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("remaining", Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("loans.rate")}</Label>
                  <Input
                    type="number"
                    value={form.rate ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setField("rate", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("loans.monthly")}</Label>
                  <Input
                    type="number"
                    value={form.monthlyPayment ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setField("monthlyPayment", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("loans.term")}</Label>
                  <Input
                    type="number"
                    value={form.termMonths ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setField("termMonths", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("loans.relatedCategory")}</Label>
                  <Select
                    value={form.relatedCategoryId ?? "__none__"}
                    onValueChange={(v: string) => setField("relatedCategoryId", v === "__none__" ? undefined : v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t("loans.none")}</SelectItem>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {getCategoryName(cat, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">{t("loans.notes")}</Label>
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

      <Card>
        <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
          <CardTitle className="text-sm sm:text-base">{t("loans.overview")}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t("loans.name")}</TableHead>
                  <TableHead className="text-right text-xs">{t("loans.principal")}</TableHead>
                  <TableHead className="text-right text-xs">{t("loans.remaining")}</TableHead>
                  <TableHead className="text-right text-xs">{t("loans.rate")}</TableHead>
                  <TableHead className="text-right text-xs">{t("loans.progress")}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const paid = loan.principal - loan.remaining
                  const progress = loan.principal > 0 ? Math.round((paid / loan.principal) * 100) : 0
                  const budgetPaid = getPaidFromBudget(loan)
                  const hasSchedule = loan.rate && loan.termMonths && loan.rate > 0 && loan.termMonths > 0
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="py-1.5 text-xs font-medium sm:text-sm">
                        <div className="flex items-center gap-1">
                          {loan.name}
                          {loan.relatedCategoryId && (
                            <Link className="h-3 w-3 text-blue-400" />
                          )}
                        </div>
                        {budgetPaid > 0 && (
                          <span className="text-[9px] text-muted-foreground">
                            {t("loans.paidFromBudget")}: {formatMNT(budgetPaid)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-1.5 text-right text-xs sm:text-sm">{formatMNT(loan.principal)}</TableCell>
                      <TableCell className="py-1.5 text-right text-xs sm:text-sm">{formatMNT(loan.remaining)}</TableCell>
                      <TableCell className="py-1.5 text-right text-xs sm:text-sm">
                        {loan.rate != null ? `${loan.rate}%` : "—"}
                      </TableCell>
                      <TableCell className="py-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className="h-1.5 w-12 rounded-full bg-muted">
                            <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[10px]">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex gap-0.5">
                          {hasSchedule && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setScheduleId(scheduleId === loan.id ? null : loan.id)}
                            >
                              <CalendarClock className="h-3 w-3 text-blue-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(loan)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeLoan(loan.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="text-xs font-bold sm:text-sm">{t("loans.total")}</TableCell>
                  <TableCell className="text-right text-xs font-bold sm:text-sm">{formatMNT(totalPrincipal)}</TableCell>
                  <TableCell className="text-right text-xs font-bold sm:text-sm">{formatMNT(total)}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Amortization Schedule */}
      {scheduleLoan && scheduleRows.length > 0 && (
        <Card>
          <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
            <CardTitle className="text-sm sm:text-base">
              <CalendarClock className="mr-1 inline h-4 w-4 text-blue-500" />
              {t("loans.schedule")} — {scheduleLoan.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t("loans.month")}</TableHead>
                    <TableHead className="text-right text-xs">{t("loans.payment")}</TableHead>
                    <TableHead className="text-right text-xs">{t("loans.interest")}</TableHead>
                    <TableHead className="text-right text-xs">{t("loans.principalPart")}</TableHead>
                    <TableHead className="text-right text-xs">{t("loans.balance")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleRows.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="py-1 text-xs">{row.month}</TableCell>
                      <TableCell className="py-1 text-right text-xs">{formatMNT(row.payment)}</TableCell>
                      <TableCell className="py-1 text-right text-xs text-orange-600">{formatMNT(row.interest)}</TableCell>
                      <TableCell className="py-1 text-right text-xs text-green-600">{formatMNT(row.principalPart)}</TableCell>
                      <TableCell className="py-1 text-right text-xs">{formatMNT(row.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
