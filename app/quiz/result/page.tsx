import { QuizResult } from "@/components/quiz/quiz-result"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function QuizResultPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <QuizResult />
        </main>
      </div>
    </ProtectedRoute>
  )
}
