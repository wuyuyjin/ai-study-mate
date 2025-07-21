import { Suspense } from "react"
import { Dashboard } from "@/components/dashboard"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  )
}
