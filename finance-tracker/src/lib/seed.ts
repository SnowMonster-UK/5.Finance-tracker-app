import type { Category, Loan } from "./types"

export const defaultCategories: Category[] = [
  // Income
  { id: "inc-salary", name: "Salary", nameMn: "Цалин", kind: "income", order: 1 },
  { id: "inc-extra", name: "Extra money", nameMn: "Нэмэлт орлого", kind: "income", order: 2 },
  // Expense - Fixed
  { id: "exp-car", name: "Car", nameMn: "Машин", kind: "expense", isFixed: true, order: 1 },
  { id: "exp-bank-loan", name: "Bank Loan", nameMn: "Банкны зээл", kind: "expense", isFixed: true, order: 2 },
  { id: "exp-rent", name: "Rent", nameMn: "Түрээс", kind: "expense", isFixed: true, order: 4 },
  { id: "exp-water-heat", name: "Water/Heat", nameMn: "Ус/Халаалт", kind: "expense", isFixed: true, order: 5 },
  { id: "exp-electricity", name: "Electricity", nameMn: "Цахилгаан", kind: "expense", isFixed: true, order: 6 },
  { id: "exp-internet", name: "Internet", nameMn: "Интернет", kind: "expense", isFixed: true, order: 7 },
  // Expense - Variable
  { id: "exp-food", name: "Food", nameMn: "Хоол", kind: "expense", order: 9 },
  { id: "exp-travel", name: "Travel", nameMn: "Аялал", kind: "expense", order: 13 },
  // Deposit
  { id: "dep-save", name: "Save", nameMn: "Хадгаламж", kind: "deposit", order: 1 },
]

export const defaultLoans: Loan[] = [
  {
    id: "loan-car",
    name: "Car",
    principal: 18_920_000,
    remaining: 0,
    relatedCategoryId: "exp-car",
    monthlyPayment: 0,
    notes: "Car loan",
  },
  {
    id: "loan-bank",
    name: "Bank Loan",
    principal: 12_000_000,
    remaining: 0,
    relatedCategoryId: "exp-bank-loan",
    monthlyPayment: 0,
    notes: "Bank loan",
  },
  {
    id: "loan-moki",
    name: "MOKI",
    principal: 2_400_000,
    rate: 3,
    remaining: 0,
    monthlyPayment: 0,
    notes: "3% interest",
  },
]
