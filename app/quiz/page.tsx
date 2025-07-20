import { QuizInterface } from "@/components/quiz-interface"
import { Header } from "@/components/header"

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <QuizInterface />
      </main>
    </div>
  )
}
