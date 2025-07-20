import { CardsManager } from "@/components/cards-manager"
import { Header } from "@/components/header"

export default function CardsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <CardsManager />
      </main>
    </div>
  )
}
