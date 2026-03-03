import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, FileDown, Check, Plus, Pencil, Trash2, X } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useLocale } from "@/store/useLocale"
import { generatePdf } from "@/lib/pdf-export"

export function SettingsDialog() {
  const {
    userName, setUserName,
    categories, addCategory, updateCategory, removeCategory,
    budgets, loans, goals,
  } = useStore()
  const { t, locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [nameInput, setNameInput] = useState(userName)
  const [saved, setSaved] = useState(false)

  // Category management state
  const [newCatName, setNewCatName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const expenseCategories = useMemo(
    () =>
      categories
        .filter((c) => c.kind === "expense")
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [categories]
  )

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setNameInput(userName)
      setSaved(false)
      setNewCatName("")
      setEditingId(null)
    }
  }

  function handleSaveName() {
    setUserName(nameInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleExportPdf() {
    generatePdf({ categories, budgets, loans, goals, locale, t })
  }

  function handleAddCategory() {
    const name = newCatName.trim()
    if (!name) return
    const maxOrder = expenseCategories.reduce((m, c) => Math.max(m, c.order ?? 0), 0)
    addCategory({
      id: `exp-${Date.now()}`,
      name,
      kind: "expense",
      order: maxOrder + 1,
    })
    setNewCatName("")
  }

  function handleStartEdit(id: string, name: string) {
    setEditingId(id)
    setEditingName(name)
  }

  function handleSaveEdit(id: string) {
    const name = editingName.trim()
    if (!name) return
    updateCategory(id, { name })
    setEditingId(null)
  }

  function handleDeleteCategory(id: string) {
    if (window.confirm(t("settings.deleteConfirm"))) {
      removeCategory(id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600">
          <Settings className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4 text-violet-500" />
            {t("settings.title")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-2">
            {/* User Name */}
            <div className="space-y-2">
              <Label htmlFor="user-name" className="text-sm font-medium">
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
                  className="h-9 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSaveName}
                  className="h-9 shrink-0"
                  variant={saved ? "outline" : "default"}
                >
                  {saved ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5 text-emerald-500" />
                      {t("settings.saved")}
                    </>
                  ) : (
                    t("common.save")
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Expense Categories */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("settings.categories")}</p>
              <p className="text-xs text-muted-foreground">
                {t("settings.categoriesDesc")}
              </p>

              {/* Category List */}
              <div className="space-y-1">
                {expenseCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5"
                  >
                    {editingId === cat.id ? (
                      <>
                        <Input
                          value={editingName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditingName(e.target.value)
                          }
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === "Enter") handleSaveEdit(cat.id)
                            if (e.key === "Escape") setEditingId(null)
                          }}
                          className="h-7 flex-1 text-xs"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleSaveEdit(cat.id)}
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-xs font-medium text-slate-700">
                          {cat.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleStartEdit(cat.id, cat.name)}
                        >
                          <Pencil className="h-3 w-3 text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Category */}
              <div className="flex gap-2">
                <Input
                  value={newCatName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewCatName(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") handleAddCategory()
                  }}
                  placeholder={t("settings.categoryName")}
                  className="h-8 flex-1 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim()}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  {t("settings.addCategory")}
                </Button>
              </div>
            </div>

            <Separator />

            {/* PDF Export */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("settings.exportPdf")}</p>
              <p className="text-xs text-muted-foreground">
                {t("settings.exportPdfDesc")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                className="w-full"
              >
                <FileDown className="mr-2 h-4 w-4 text-violet-500" />
                {t("settings.exportPdf")}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
