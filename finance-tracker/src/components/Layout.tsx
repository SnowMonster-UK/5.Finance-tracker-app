import { useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  CalendarDays,
  Landmark,
  Target,
  Globe,
  Settings,
} from "lucide-react"
import { useLocale } from "@/store/useLocale"
import { useStore } from "@/store/useStore"
import type { TranslationKey } from "@/lib/i18n"

const navItems: {
  to: string
  labelKey: TranslationKey
  icon: typeof LayoutDashboard
  color: string
  activeColor: string
}[] = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, color: "text-violet-500", activeColor: "bg-violet-100 text-violet-600" },
  { to: "/budget", labelKey: "nav.budget", icon: CalendarDays, color: "text-emerald-500", activeColor: "bg-emerald-100 text-emerald-600" },
  { to: "/loans", labelKey: "nav.loans", icon: Landmark, color: "text-orange-500", activeColor: "bg-orange-100 text-orange-600" },
  { to: "/goals", labelKey: "nav.goals", icon: Target, color: "text-pink-500", activeColor: "bg-pink-100 text-pink-600" },
]

export function Layout() {
  const { locale, setLocale, t } = useLocale()
  const userName = useStore((s) => s.userName)
  const darkMode = useStore((s) => s.darkMode)
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  function toggleLocale() {
    setLocale(locale === "mn" ? "en" : "mn")
  }

  const displayTitle = userName
    ? `${userName}${t("settings.possessive")} ${t("app.title")}`
    : t("app.title")

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20 dark:from-slate-950 dark:to-slate-900">
      {/* Top header with gradient */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img
              src="/app-icon.png"
              alt=""
              className="h-8 w-8 rounded-lg"
            />
            <h1 className="bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 bg-clip-text text-sm font-extrabold tracking-tight text-transparent sm:text-base">
              {displayTitle}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Globe className="h-3.5 w-3.5" />
              {locale === "mn" ? "EN" : "MN"}
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
        <Outlet />
      </main>

      {/* Bottom navigation — colorful */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-around px-2">
          {navItems.map(({ to, labelKey, icon: Icon, color, activeColor }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-[10px] font-semibold transition-all ${
                  isActive ? activeColor : "text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                      isActive
                        ? activeColor + " shadow-sm"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "" : color}`} />
                  </div>
                  <span>{t(labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
