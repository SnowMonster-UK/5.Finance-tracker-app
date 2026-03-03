import { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { FileDown, Check, Plus, Pencil, Trash2, X, ChevronLeft, ChevronUp, ChevronDown, Moon, Sun, RotateCcw, Download, Upload, Coins } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useLocale } from "@/store/useLocale"
import { generatePdf } from "@/lib/pdf-export"
import { getCategoryName } from "@/lib/i18n"
import type { Category } from "@/lib/types"

function CategoryListEditor({
  categories,
  kind,
  onAdd,
  onUpdate,
  onDelete,
  onMove,
  locale,
  t,
}: {
  categories: Category[]
  kind: "income" | "expense" | "deposit"
  onAdd: (name: string, nameMn: string, kind: "income" | "expense" | "deposit") => void
  onUpdate: (id: string, updates: Partial<Category>) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: -1 | 1) => void
  locale: string
  t: (key: any) => string
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editingNameMn, setEditingNameMn] = useState("")
  const [newName, setNewName] = useState("")
  const [newNameMn, setNewNameMn] = useState("")

  function handleStartEdit(cat: Category) {
    setEditingId(cat.id)
    setEditingName(cat.name)
    setEditingNameMn(cat.nameMn ?? "")
  }

  function handleSaveEdit(id: string) {
    const name = editingName.trim()
    if (!name) return
    onUpdate(id, { name, nameMn: editingNameMn.trim() || undefined })
    setEditingId(null)
  }

  function handleAdd() {
    const name = newName.trim()
    if (!name) return
    onAdd(name, newNameMn.trim(), kind)
    setNewName("")
    setNewNameMn("")
  }

  function handleDelete(id: string) {
    if (window.confirm(t("settings.deleteConfirm"))) {
      onDelete(id)
    }
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          >
            {editingId === cat.id ? (
              <>
                <div className="flex flex-1 flex-col gap-1">
                  <Input
                    value={editingName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingName(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === "Enter") handleSaveEdit(cat.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    placeholder="EN"
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <Input
                    value={editingNameMn}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingNameMn(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === "Enter") handleSaveEdit(cat.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    placeholder="MN"
                    className="h-7 text-xs"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleSaveEdit(cat.id)}
                >
                  <Check className="h-4 w-4 text-emerald-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setEditingId(null)}
                >
                  <X className="h-4 w-4 text-slate-400" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={() => onMove(cat.id, -1)}
                    disabled={idx === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={() => onMove(cat.id, 1)}
                    disabled={idx === categories.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {getCategoryName(cat, locale as any)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleStartEdit(cat)}
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleDelete(cat.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Input
            value={newName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewName(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") handleAdd()
            }}
            placeholder={t("settings.categoryName")}
            className="h-8 text-xs"
          />
          <Input
            value={newNameMn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewNameMn(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") handleAdd()
            }}
            placeholder={t("settings.categoryNameMn")}
            className="h-8 text-xs"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-[68px] shrink-0"
          onClick={handleAdd}
          disabled={!newName.trim()}
        >
          <Plus className="mr-1 h-4 w-4" />
          {t("settings.addCategory")}
        </Button>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()
  const {
    userName, setUserName,
    darkMode, setDarkMode,
    categories, addCategory, updateCategory, removeCategory, moveCategoryOrder,
    budgets, loans, goals,
    currency, currencyRates, setCurrency, setCurrencyRate,
    exportData, importData, resetToDefaults,
  } = useStore()
  const { t, locale } = useLocale()
  const [nameInput, setNameInput] = useState(userName)
  const [saved, setSaved] = useState(false)
  const [importMsg, setImportMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

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

  const expenseCategories = useMemo(
    () =>
      categories
        .filter((c) => c.kind === "expense")
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [categories]
  )

  function handleSaveName() {
    setUserName(nameInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleExportPdf() {
    generatePdf({ categories, budgets, loans, goals, locale, t })
  }

  function handleExportJson() {
    const data = exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finance-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.categories && data.budgets) {
          importData(data)
          setImportMsg({ text: t("data.importSuccess"), ok: true })
        } else {
          setImportMsg({ text: t("data.importError"), ok: false })
        }
      } catch {
        setImportMsg({ text: t("data.importError"), ok: false })
      }
      setTimeout(() => setImportMsg(null), 3000)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  function handleReset() {
    if (window.confirm(t("data.resetConfirm"))) {
      resetToDefaults()
    }
  }

  function handleAddCategory(name: string, nameMn: string, kind: "income" | "expense" | "deposit") {
    const list = kind === "income" ? incomeCategories : kind === "deposit" ? depositCategories : expenseCategories
    const maxOrder = list.reduce((m, c) => Math.max(m, c.order ?? 0), 0)
    const prefix = kind === "income" ? "inc" : kind === "deposit" ? "dep" : "exp"
    addCategory({
      id: `${prefix}-${Date.now()}`,
      name,
      nameMn: nameMn || undefined,
      kind,
      order: maxOrder + 1,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold sm:text-2xl">{t("settings.title")}</h2>
      </div>

      {/* User Name */}
      <Card>
        <CardContent className="space-y-3 px-4 pt-4 pb-4">
          <Label htmlFor="user-name" className="text-sm font-semibold">
            {t("settings.userName")}
          </Label>
          <div className="flex gap-2">
            <Input
              id="user-name"
              value={nameInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNameInput(e.target.value)
              }
              placeholder={t("settings.userNamePlaceholder")}
              className="h-10 text-sm"
            />
            <Button
              size="sm"
              onClick={handleSaveName}
              className="h-10 shrink-0 px-4"
              variant={saved ? "outline" : "default"}
            >
              {saved ? (
                <>
                  <Check className="mr-1 h-4 w-4 text-emerald-500" />
                  {t("settings.saved")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dark Mode */}
      <Card>
        <CardContent className="flex items-center justify-between px-4 pt-4 pb-4">
          <div>
            <p className="text-sm font-semibold">{t("settings.darkMode")}</p>
            <p className="text-xs text-muted-foreground">{t("settings.darkModeDesc")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            className="gap-2"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            {darkMode ? "Light" : "Dark"}
          </Button>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardContent className="space-y-3 px-4 pt-4 pb-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">{t("settings.currency")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.currencyDesc")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(["MNT", "JPY", "USD"] as const).map((c) => (
              <Button
                key={c}
                variant={currency === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrency(c)}
                className="flex-1"
              >
                {{ MNT: "₮ MNT", JPY: "¥ JPY", USD: "$ USD" }[c]}
              </Button>
            ))}
          </div>
          {currency !== "MNT" && (
            <div className="space-y-2 rounded-md border p-3">
              <Label className="text-xs font-medium">
                {t("settings.currencyRate")}: 1 {currency} = ? MNT
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={currencyRates[currency]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = Number(e.target.value)
                    if (v > 0) setCurrencyRate(currency, v)
                  }}
                  className="h-8 w-32 text-sm"
                  min={0.01}
                  step="any"
                />
                <span className="text-xs text-muted-foreground">MNT</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                e.g. ₮1,000,000 = {{ JPY: `¥${(1_000_000 / currencyRates.JPY).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, USD: `$${(1_000_000 / currencyRates.USD).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }[currency]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income Categories */}
      <Card>
        <CardContent className="space-y-3 px-4 pt-4 pb-4">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">{t("settings.incomeCategories")}</p>
          <p className="text-xs text-muted-foreground">{t("settings.incomeCategoriesDesc")}</p>
          <CategoryListEditor
            categories={incomeCategories}
            kind="income"
            onAdd={handleAddCategory}
            onUpdate={updateCategory}
            onDelete={removeCategory}
            onMove={moveCategoryOrder}
            locale={locale}
            t={t}
          />
        </CardContent>
      </Card>

      {/* Deposit Categories */}
      <Card>
        <CardContent className="space-y-3 px-4 pt-4 pb-4">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">{t("settings.depositCategories")}</p>
          <p className="text-xs text-muted-foreground">{t("settings.depositCategoriesDesc")}</p>
          <CategoryListEditor
            categories={depositCategories}
            kind="deposit"
            onAdd={handleAddCategory}
            onUpdate={updateCategory}
            onDelete={removeCategory}
            onMove={moveCategoryOrder}
            locale={locale}
            t={t}
          />
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card>
        <CardContent className="space-y-3 px-4 pt-4 pb-4">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{t("settings.categories")}</p>
          <p className="text-xs text-muted-foreground">{t("settings.categoriesDesc")}</p>
          <CategoryListEditor
            categories={expenseCategories}
            kind="expense"
            onAdd={handleAddCategory}
            onUpdate={updateCategory}
            onDelete={removeCategory}
            onMove={moveCategoryOrder}
            locale={locale}
            t={t}
          />
        </CardContent>
      </Card>

      {/* PDF Export */}
      <Card>
        <CardContent className="space-y-3 px-4 pt-4 pb-4">
          <p className="text-sm font-semibold">{t("settings.exportPdf")}</p>
          <p className="text-xs text-muted-foreground">{t("settings.exportPdfDesc")}</p>
          <Button variant="outline" size="sm" onClick={handleExportPdf} className="w-full">
            <FileDown className="mr-2 h-4 w-4 text-violet-500" />
            {t("settings.exportPdf")}
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardContent className="space-y-3 px-4 pt-4 pb-4">
          <p className="text-sm font-semibold">{t("settings.dataManagement")}</p>
          <p className="text-xs text-muted-foreground">{t("settings.dataManagementDesc")}</p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJson} className="w-full">
              <Download className="mr-2 h-4 w-4 text-blue-500" />
              {t("data.exportBtn")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="w-full">
              <Upload className="mr-2 h-4 w-4 text-green-500" />
              {t("data.importBtn")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={handleReset} className="w-full text-red-600 hover:text-red-700">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("data.resetBtn")}
            </Button>
          </div>
          {importMsg && (
            <p className={`text-xs ${importMsg.ok ? "text-green-600" : "text-red-600"}`}>
              {importMsg.text}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
