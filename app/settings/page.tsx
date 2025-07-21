import { SettingsPage } from "@/components/settings-page"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Settings() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <SettingsPage />
        </main>
      </div>
    </ProtectedRoute>
  )
}
