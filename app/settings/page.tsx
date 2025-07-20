import { SettingsPage } from "@/components/settings-page"
import { Header } from "@/components/header"

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SettingsPage />
      </main>
    </div>
  )
}
