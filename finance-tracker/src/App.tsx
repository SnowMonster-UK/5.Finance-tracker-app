import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { Dashboard } from "@/pages/Dashboard"
import { Budget } from "@/pages/Budget"
import { Loans } from "@/pages/Loans"
import { Goals } from "@/pages/Goals"
import { SettingsPage } from "@/pages/SettingsPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
