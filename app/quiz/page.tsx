import { QuizInterface } from "@/components/quiz/quiz-interface"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <QuizInterface />
        </main>
      </div>
    </ProtectedRoute>
  )
}
