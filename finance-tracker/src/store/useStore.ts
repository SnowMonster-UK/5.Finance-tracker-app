import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Category, MonthlyBudget, Loan, Goal, MonthKey, AppData } from "@/lib/types"
import { CURRENT_SCHEMA_VERSION } from "@/lib/types"
import { defaultCategories, defaultLoans } from "@/lib/seed"

interface FinanceState {
  version: number
  categories: Category[]
  budgets: Record<MonthKey, MonthlyBudget>
  loans: Loan[]
  goals: Goal[]
  userName: string
  darkMode: boolean
  currency: "MNT" | "JPY" | "USD"
  currencyRates: { JPY: number; USD: number }

  // Settings actions
  setUserName: (name: string) => void
  setDarkMode: (dark: boolean) => void
  setCurrency: (c: "MNT" | "JPY" | "USD") => void
  setCurrencyRate: (code: "JPY" | "USD", rate: number) => void

  // Category actions
  addCategory: (cat: Category) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  removeCategory: (id: string) => void
  moveCategoryOrder: (id: string, direction: -1 | 1) => void

  // Budget actions
  setBudgetEntry: (
    monthKey: MonthKey,
    categoryId: string,
    field: "plan" | "actual",
    value: number
  ) => void
  initMonth: (monthKey: MonthKey) => void
  applyFixedTemplate: (monthKey: MonthKey) => void
  copyPreviousMonth: (monthKey: MonthKey) => boolean

  // Loan actions
  addLoan: (loan: Loan) => void
  updateLoan: (id: string, updates: Partial<Loan>) => void
  removeLoan: (id: string) => void
  recalcLoanRemaining: () => void

  // Goal actions
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  removeGoal: (id: string) => void

  // Import/Export
  exportData: () => AppData
  importData: (data: AppData) => void
  resetToDefaults: () => void
}

const initialState = {
  version: CURRENT_SCHEMA_VERSION,
  categories: defaultCategories,
  budgets: {} as Record<MonthKey, MonthlyBudget>,
  loans: defaultLoans,
  goals: [] as Goal[],
  userName: "",
  darkMode: false,
  currency: "MNT" as "MNT" | "JPY" | "USD",
  currencyRates: { JPY: 25, USD: 3450 },
}

function getPreviousMonthKey(monthKey: MonthKey): MonthKey {
  const [y, m] = monthKey.split("-").map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function calcLoanPaidFromBudgets(
  loan: Loan,
  budgets: Record<MonthKey, MonthlyBudget>
): number {
  if (!loan.relatedCategoryId) return 0
  let total = 0
  for (const mk of Object.keys(budgets)) {
    const entry = budgets[mk]?.entries[loan.relatedCategoryId]
    if (entry) total += entry.actual
  }
  return total
}

export const useStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Settings ──
      setUserName: (name) => set({ userName: name }),
      setDarkMode: (dark) => set({ darkMode: dark }),
      setCurrency: (c) => set({ currency: c }),
      setCurrencyRate: (code, rate) =>
        set((s) => ({ currencyRates: { ...s.currencyRates, [code]: rate } })),

      // ── Categories ──
      addCategory: (cat) =>
        set((s) => ({ categories: [...s.categories, cat] })),

      updateCategory: (id, updates) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      removeCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      moveCategoryOrder: (id, direction) =>
        set((s) => {
          const cat = s.categories.find((c) => c.id === id)
          if (!cat) return s
          const sameKind = s.categories
            .filter((c) => c.kind === cat.kind)
            .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
          const idx = sameKind.findIndex((c) => c.id === id)
          const swapIdx = idx + direction
          if (swapIdx < 0 || swapIdx >= sameKind.length) return s
          const orderA = sameKind[idx].order ?? idx
          const orderB = sameKind[swapIdx].order ?? swapIdx
          return {
            categories: s.categories.map((c) => {
              if (c.id === sameKind[idx].id) return { ...c, order: orderB }
              if (c.id === sameKind[swapIdx].id) return { ...c, order: orderA }
              return c
            }),
          }
        }),

      // ── Budgets ──
      setBudgetEntry: (monthKey, categoryId, field, value) =>
        set((s) => {
          const budget = s.budgets[monthKey] ?? {
            monthKey,
            entries: {},
          }
          const entry = budget.entries[categoryId] ?? { plan: 0, actual: 0 }
          const newBudgets = {
            ...s.budgets,
            [monthKey]: {
              ...budget,
              entries: {
                ...budget.entries,
                [categoryId]: { ...entry, [field]: value },
              },
            },
          }

          // Auto-recalc loan remaining when actual changes for linked categories
          if (field === "actual") {
            const updatedLoans = s.loans.map((loan) => {
              if (loan.relatedCategoryId === categoryId) {
                const paid = calcLoanPaidFromBudgets(loan, newBudgets)
                return { ...loan, remaining: Math.max(0, loan.principal - paid) }
              }
              return loan
            })
            return { budgets: newBudgets, loans: updatedLoans }
          }

          return { budgets: newBudgets }
        }),

      initMonth: (monthKey) =>
        set((s) => {
          if (s.budgets[monthKey]) return s
          const entries: Record<string, { plan: number; actual: number }> = {}
          for (const cat of s.categories) {
            entries[cat.id] = { plan: 0, actual: 0 }
          }
          return {
            budgets: {
              ...s.budgets,
              [monthKey]: { monthKey, entries },
            },
          }
        }),

      applyFixedTemplate: (monthKey) =>
        set((s) => {
          const budget = s.budgets[monthKey] ?? { monthKey, entries: {} }
          const entries = { ...budget.entries }
          for (const cat of s.categories) {
            if (!entries[cat.id]) {
              entries[cat.id] = { plan: 0, actual: 0 }
            }
          }
          return {
            budgets: {
              ...s.budgets,
              [monthKey]: { ...budget, entries },
            },
          }
        }),

      copyPreviousMonth: (monthKey) => {
        const s = get()
        const prevKey = getPreviousMonthKey(monthKey)
        const prevBudget = s.budgets[prevKey]
        if (!prevBudget) return false

        const currentBudget = s.budgets[monthKey] ?? { monthKey, entries: {} }
        const entries = { ...currentBudget.entries }
        for (const [catId, prevEntry] of Object.entries(prevBudget.entries)) {
          if (!entries[catId]) {
            entries[catId] = { plan: prevEntry.plan, actual: 0 }
          } else {
            entries[catId] = { ...entries[catId], plan: prevEntry.plan }
          }
        }
        set({
          budgets: {
            ...s.budgets,
            [monthKey]: { ...currentBudget, entries },
          },
        })
        return true
      },

      // ── Loans ──
      addLoan: (loan) =>
        set((s) => {
          // Auto-create expense category if no relatedCategoryId
          if (!loan.relatedCategoryId) {
            const expCats = s.categories.filter((c) => c.kind === "expense")
            const maxOrder = expCats.reduce((m, c) => Math.max(m, c.order ?? 0), 0)
            const catId = `exp-loan-${Date.now()}`
            const newCat = {
              id: catId,
              name: loan.name,
              kind: "expense" as const,
              order: maxOrder + 1,
            }
            return {
              loans: [...s.loans, { ...loan, relatedCategoryId: catId }],
              categories: [...s.categories, newCat],
            }
          }
          return { loans: [...s.loans, loan] }
        }),

      updateLoan: (id, updates) =>
        set((s) => ({
          loans: s.loans.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),

      removeLoan: (id) =>
        set((s) => {
          const loan = s.loans.find((l) => l.id === id)
          const catId = loan?.relatedCategoryId
          // Remove auto-created category if it starts with "exp-loan-"
          const shouldRemoveCat = catId && catId.startsWith("exp-loan-")
          return {
            loans: s.loans.filter((l) => l.id !== id),
            ...(shouldRemoveCat ? { categories: s.categories.filter((c) => c.id !== catId) } : {}),
          }
        }),

      recalcLoanRemaining: () =>
        set((s) => ({
          loans: s.loans.map((loan) => {
            if (!loan.relatedCategoryId) return loan
            const paid = calcLoanPaidFromBudgets(loan, s.budgets)
            return { ...loan, remaining: Math.max(0, loan.principal - paid) }
          }),
        })),

      // ── Goals ──
      addGoal: (goal) =>
        set((s) => ({ goals: [...s.goals, goal] })),

      updateGoal: (id, updates) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      // ── Import/Export ──
      exportData: () => {
        const s = get()
        return {
          version: s.version,
          categories: s.categories,
          budgets: s.budgets,
          loans: s.loans,
          goals: s.goals,
          userName: s.userName,
        }
      },

      importData: (data) =>
        set({
          version: data.version,
          categories: data.categories,
          budgets: data.budgets,
          loans: data.loans,
          goals: data.goals,
        }),

      resetToDefaults: () => set(initialState),
    }),
    {
      name: "finance-app-v1",
      version: CURRENT_SCHEMA_VERSION,
    }
  )
)
