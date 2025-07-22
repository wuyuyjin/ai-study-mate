import { FavoritesManager } from "@/components/favorites-manager"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <FavoritesManager />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
