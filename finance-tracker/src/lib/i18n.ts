export type Locale = "mn" | "en"

const translations = {
  // ── App ──
  "app.title": { mn: "Санхүүгийн Менежер", en: "Finance Tracker" },

  // ── Nav ──
  "nav.dashboard": { mn: "Хянах", en: "Dashboard" },
  "nav.budget": { mn: "Төсөв", en: "Budget" },
  "nav.loans": { mn: "Зээл", en: "Loans" },
  "nav.goals": { mn: "Зорилго", en: "Goals" },
  "nav.data": { mn: "Өгөгдөл", en: "Data" },

  // ── Dashboard ──
  "dash.title": { mn: "Хянах самбар", en: "Dashboard" },
  "dash.income": { mn: "Орлого", en: "Income" },
  "dash.expenses": { mn: "Зарлага", en: "Expenses" },
  "dash.savings": { mn: "Хэмнэлт", en: "Savings" },
  "dash.loanBalance": { mn: "Зээлийн үлдэгдэл", en: "Loan Balance" },
  "dash.goals": { mn: "Зорилго", en: "Goals" },
  "dash.surplus": { mn: "Илүүдэл", en: "Surplus" },
  "dash.deficit": { mn: "Алдагдал", en: "Deficit" },
  "dash.loans": { mn: "зээл", en: "loans" },
  "dash.goalsCount": { mn: "зорилго", en: "goals" },
  "dash.deposits": { mn: "Хадгаламж", en: "Deposits" },
  "dash.depositsTotal": { mn: "Нийт хадгаламж", en: "Total deposits" },
  "dash.noData": {
    mn: "Төсвийн мэдээлэл байхгүй байна. Төсөв хэсэгт орж эхний сарыг оруулна уу.",
    en: "No budget data yet. Go to Budget to enter your first month.",
  },
  "dash.chartA": { mn: "(A) Мөнгөн урсгалын тойм — Сар бүр", en: "(A) Cash Flow Overview — Monthly" },
  "dash.chartB": { mn: "(B) Төлөвлөгөө vs Бодит", en: "(B) Plan vs Reality" },
  "dash.chartC": { mn: "(C) Өр ба Хөрөнгийн өөрчлөлт", en: "(C) Debt & Assets Over Time" },
  "dash.diffLabel": { mn: "Зөрүү (Бодит - Төлөвлөгөө)", en: "Diff (Reality - Plan)" },
  "dash.loanBalanceLine": { mn: "Зээлийн үлдэгдэл", en: "Loan Balance" },
  "dash.cumulativeSavings": { mn: "Нийт хэмнэлт", en: "Cumulative Savings" },
  "dash.net": { mn: "Цэвэр (Хөрөнгө - Өр)", en: "Net (Assets - Debt)" },

  // ── Budget ──
  "budget.title": { mn: "Сарын төсөв", en: "Monthly Budget" },
  "budget.income": { mn: "Орлого", en: "Income" },
  "budget.expense": { mn: "Зарлага", en: "Expenses" },
  "budget.expenseFixed": { mn: "Зарлага 1 (Тогтмол)", en: "Expenses 1 (Fixed)" },
  "budget.expenseVariable": { mn: "Зарлага 2 (Хувьсах)", en: "Expenses 2 (Variable)" },
  "budget.expenseTotal": { mn: "Нийт зарлага", en: "Total Expenses" },
  "budget.category": { mn: "Ангилал", en: "Category" },
  "budget.plan": { mn: "Төлөвлөгөө", en: "Plan" },
  "budget.reality": { mn: "Бодит", en: "Reality" },
  "budget.diff": { mn: "Зөрүү", en: "Diff" },
  "budget.total": { mn: "Нийт", en: "Total" },
  "budget.initMonth": { mn: "Сар эхлүүлэх", en: "Initialize Month" },
  "budget.applyTemplate": { mn: "Загвар ашиглах", en: "Apply Template" },
  "budget.fixed": { mn: "тогтмол", en: "fixed" },
  "budget.actual": { mn: "Бодит", en: "Actual" },
  "budget.copyPrevMonth": { mn: "Өмнөх сараас хуулах", en: "Copy from Previous" },
  "budget.copySuccess": { mn: "Хуулагдлаа!", en: "Copied!" },
  "budget.noPrevMonth": { mn: "Өмнөх сарын мэдээлэл алга", en: "No previous month data" },
  "budget.deposit": { mn: "Хадгаламж", en: "Deposits" },
  "budget.overBudget": { mn: "Хэтэрсэн", en: "Over budget" },
  "budget.vsLastMonth": { mn: "Өмнөх сартай харьцуулахад", en: "vs last month" },

  // ── Loans ──
  "loans.title": { mn: "Зээлүүд", en: "Loans" },
  "loans.addLoan": { mn: "Зээл нэмэх", en: "Add Loan" },
  "loans.editLoan": { mn: "Зээл засах", en: "Edit Loan" },
  "loans.overview": { mn: "Зээлийн тойм", en: "Loan Overview" },
  "loans.name": { mn: "Нэр", en: "Name" },
  "loans.principal": { mn: "Үндсэн дүн", en: "Principal" },
  "loans.remaining": { mn: "Үлдэгдэл", en: "Remaining" },
  "loans.rate": { mn: "Хүү (%)", en: "Rate (%)" },
  "loans.monthly": { mn: "Сарын төлбөр", en: "Monthly" },
  "loans.progress": { mn: "Явц", en: "Progress" },
  "loans.paidTotal": { mn: "Нийт төлсөн", en: "Paid Total" },
  "loans.term": { mn: "Хугацаа (сар)", en: "Term (months)" },
  "loans.notes": { mn: "Тэмдэглэл", en: "Notes" },
  "loans.total": { mn: "Нийт", en: "Total" },
  "loans.relatedCategory": { mn: "Холбоотой ангилал", en: "Related Category" },
  "loans.none": { mn: "Байхгүй", en: "None" },
  "loans.schedule": { mn: "Төлбөрийн хуваарь", en: "Payment Schedule" },
  "loans.month": { mn: "Сар", en: "Month" },
  "loans.payment": { mn: "Төлбөр", en: "Payment" },
  "loans.interest": { mn: "Хүү", en: "Interest" },
  "loans.principalPart": { mn: "Үндсэн", en: "Principal" },
  "loans.balance": { mn: "Үлдэгдэл", en: "Balance" },
  "loans.paidFromBudget": { mn: "Төсвөөс төлсөн", en: "Paid from budget" },

  // ── Goals ──
  "goals.title": { mn: "Зорилго", en: "Goals" },
  "goals.addGoal": { mn: "Зорилго нэмэх", en: "Add Goal" },
  "goals.editGoal": { mn: "Зорилго засах", en: "Edit Goal" },
  "goals.noGoals": {
    mn: "Зорилго байхгүй байна. Эхний зорилгоо нэмнэ үү.",
    en: "No goals yet. Add your first goal to start tracking progress.",
  },
  "goals.name": { mn: "Нэр", en: "Name" },
  "goals.scope": { mn: "Хүрээ", en: "Scope" },
  "goals.type": { mn: "Төрөл", en: "Type" },
  "goals.targetAmount": { mn: "Зорилтот дүн", en: "Target Amount" },
  "goals.currentAmount": { mn: "Одоогийн дүн", en: "Current Amount" },
  "goals.targetDate": { mn: "Зорилтот огноо", en: "Target Date (optional)" },
  "goals.notes": { mn: "Тэмдэглэл", en: "Notes" },
  "goals.monthly": { mn: "Сарын", en: "Monthly" },
  "goals.yearly": { mn: "Жилийн", en: "Yearly" },
  "goals.2030": { mn: "2030", en: "2030" },
  "goals.savings": { mn: "Хэмнэлт", en: "Savings" },
  "goals.expenseCap": { mn: "Зарлагын хязгаар", en: "Expense Cap" },
  "goals.loanBalance": { mn: "Зээлийн үлдэгдэл", en: "Loan Balance" },
  "goals.personal": { mn: "Хувийн зорилго", en: "Personal" },
  "goals.goalsLabel": { mn: "Зорилго", en: "Goals" },

  // ── Data ──
  "data.title": { mn: "Импорт / Экспорт", en: "Import / Export" },
  "data.exportTitle": { mn: "Экспорт (Нөөц)", en: "Export (Backup)" },
  "data.exportDesc": {
    mn: "Бүх мэдээллээ JSON файлаар татах. Нөөцлөхөд ашиглана.",
    en: "Download all your data as a JSON file. Use this for backups.",
  },
  "data.exportBtn": { mn: "JSON экспорт", en: "Export JSON" },
  "data.importTitle": { mn: "Импорт (Сэргээх)", en: "Import (Restore)" },
  "data.importDesc": {
    mn: "Өмнө экспортлосон JSON нөөцөөс сэргээнэ. Одоогийн бүх мэдээлэл солигдоно.",
    en: "Restore from a previously exported JSON backup. This will replace all current data.",
  },
  "data.importBtn": { mn: "JSON импорт", en: "Import JSON" },
  "data.resetTitle": { mn: "Дахин тохируулах", en: "Reset" },
  "data.resetDesc": {
    mn: "Бүх зүйлийг анхны мэдээлэлд буцаана. Энэ үйлдлийг буцаах боломжгүй.",
    en: "Reset everything back to default seed data. This cannot be undone.",
  },
  "data.resetBtn": { mn: "Анхны байдалд буцаах", en: "Reset to Defaults" },
  "data.resetConfirm": {
    mn: "Энэ нь БҮХ мэдээллийг анхны байдалд буцаана. Итгэлтэй байна уу?",
    en: "This will reset ALL data to defaults. Are you sure?",
  },
  "data.importSuccess": { mn: "Мэдээлэл амжилттай импортлогдлоо!", en: "Data imported successfully!" },
  "data.importError": {
    mn: "Буруу мэдээллийн файл. Форматыг шалгана уу.",
    en: "Invalid data file. Please check the format.",
  },

  // ── Settings ──
  "settings.title": { mn: "Тохиргоо", en: "Settings" },
  "settings.userName": { mn: "Хэрэглэгчийн нэр", en: "User Name" },
  "settings.userNamePlaceholder": { mn: "Нэрээ оруулна уу", en: "Enter your name" },
  "settings.exportPdf": { mn: "PDF татах", en: "Export PDF" },
  "settings.exportPdfDesc": {
    mn: "Бүх мэдээллээ PDF файлаар хадгалах",
    en: "Save all your data as a PDF file",
  },
  "settings.saved": { mn: "Хадгалагдлаа!", en: "Saved!" },
  "settings.possessive": { mn: "-ийн", en: "'s" },
  "settings.incomeCategories": { mn: "Орлогын ангилал", en: "Income Categories" },
  "settings.incomeCategoriesDesc": {
    mn: "Орлогын ангилал нэмэх, засах, устгах. Бүх сард хамаарна.",
    en: "Add, edit, or remove income categories. Changes apply to all months.",
  },
  "settings.depositCategories": { mn: "Хадгаламжийн ангилал", en: "Deposit Categories" },
  "settings.depositCategoriesDesc": {
    mn: "Хадгаламжийн ангилал нэмэх, засах, устгах. Бүх сард хамаарна.",
    en: "Add, edit, or remove deposit categories. Changes apply to all months.",
  },
  "settings.categories": { mn: "Зарлагын ангилал", en: "Expense Categories" },
  "settings.categoriesDesc": {
    mn: "Зарлагын ангилал нэмэх, засах, устгах. Бүх сард хамаарна.",
    en: "Add, edit, or remove expense categories. Changes apply to all months.",
  },
  "settings.addCategory": { mn: "Нэмэх", en: "Add" },
  "settings.categoryName": { mn: "Нэр (EN)", en: "Name (EN)" },
  "settings.categoryNameMn": { mn: "Нэр (MN)", en: "Name (MN)" },
  "settings.deleteConfirm": {
    mn: "Энэ ангилалыг устгах уу?",
    en: "Delete this category?",
  },
  "settings.currency": { mn: "Валют", en: "Currency" },
  "settings.currencyDesc": { mn: "Харуулах валют сонгох", en: "Select display currency" },
  "settings.currencyRate": { mn: "Ханш", en: "Exchange Rate" },
  "settings.currencyRateHelper": { mn: "MNT-ээр", en: "in MNT" },
  "settings.darkMode": { mn: "Харанхуй горим", en: "Dark Mode" },
  "settings.darkModeDesc": {
    mn: "Нүдэнд зөөлөн харанхуй горим",
    en: "Easy on the eyes dark theme",
  },
  "settings.dataManagement": { mn: "Мэдээллийн удирдлага", en: "Data Management" },
  "settings.dataManagementDesc": {
    mn: "JSON нөөцлөх, сэргээх, эсвэл анхны байдалд буцаах",
    en: "Backup to JSON, restore, or reset to defaults",
  },

  // ── Common ──
  "common.save": { mn: "Хадгалах", en: "Save" },
  "common.cancel": { mn: "Цуцлах", en: "Cancel" },
  "common.others": { mn: "Бусад", en: "Others" },
  "common.by": { mn: "хүртэл", en: "by" },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key]
  if (!entry) return key
  return entry[locale] ?? entry["en"] ?? key
}

export const localeNames: Record<Locale, string> = {
  mn: "Монгол",
  en: "English",
}

/**
 * Get the localized display name for a category.
 * Returns nameMn for "mn" locale if available, otherwise falls back to name.
 */
export function getCategoryName(
  cat: { name: string; nameMn?: string },
  locale: Locale
): string {
  if (locale === "mn" && cat.nameMn) return cat.nameMn
  return cat.name
}
