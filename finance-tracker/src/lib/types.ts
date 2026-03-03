import { z } from "zod"

// ── MonthKey ──
export const MonthKeySchema = z.string().regex(/^\d{4}-\d{2}$/)
export type MonthKey = z.infer<typeof MonthKeySchema>

// ── Category ──
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  nameMn: z.string().optional(),
  kind: z.enum(["income", "expense", "deposit"]),
  isFixed: z.boolean().optional(),
  order: z.number().optional(),
})
export type Category = z.infer<typeof CategorySchema>

// ── BudgetEntry ──
export const BudgetEntrySchema = z.object({
  plan: z.number().default(0),
  actual: z.number().default(0),
})
export type BudgetEntry = z.infer<typeof BudgetEntrySchema>

// ── MonthlyBudget ──
export const MonthlyBudgetSchema = z.object({
  monthKey: MonthKeySchema,
  entries: z.record(z.string(), BudgetEntrySchema),
})
export type MonthlyBudget = z.infer<typeof MonthlyBudgetSchema>

// ── Loan ──
export const LoanSchema = z.object({
  id: z.string(),
  name: z.string(),
  principal: z.number(),
  rate: z.number().optional(),
  termMonths: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  monthlyPayment: z.number().optional(),
  paidTotal: z.number().optional(),
  remaining: z.number(),
  relatedCategoryId: z.string().optional(),
  notes: z.string().optional(),
})
export type Loan = z.infer<typeof LoanSchema>

// ── Goal ──
export const GoalSchema = z.object({
  id: z.string(),
  scope: z.enum(["monthly", "yearly", "2030"]),
  name: z.string(),
  type: z.enum(["savings", "expenseCap", "loanBalance", "personal"]),
  targetAmount: z.number(),
  targetDate: z.string().optional(),
  relatedLoanId: z.string().optional(),
  currentAmount: z.number().optional(),
  notes: z.string().optional(),
})
export type Goal = z.infer<typeof GoalSchema>

// ── App State (for persistence) ──
export const AppDataSchema = z.object({
  version: z.number(),
  categories: z.array(CategorySchema),
  budgets: z.record(MonthKeySchema, MonthlyBudgetSchema),
  loans: z.array(LoanSchema),
  goals: z.array(GoalSchema),
})
export type AppData = z.infer<typeof AppDataSchema>

export const CURRENT_SCHEMA_VERSION = 1
