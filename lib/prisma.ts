// 这里是数据库配置文件，实际项目中需要配置 Prisma
// 目前使用模拟数据，后续可以替换为真实数据库

export interface StudyCard {
  id: string
  title: string
  content: string
  tags: string[]
  qa: {
    question: string
    answer: string
  }
  createdAt: string
  updatedAt: string
  reviewCount: number
  difficulty: "easy" | "medium" | "hard"
  isFavorite: boolean
  userId: string
}

export interface User {
  id: string
  name: string
  email: string
  image?: string
  createdAt: string
  subscription: "free" | "pro"
  dailyQuota: {
    cardsGenerated: number
    quizzesTaken: number
    date: string
  }
}

// 模拟数据库操作
class MockDatabase {
  private cards: StudyCard[] = []
  private users: User[] = []

  async createCard(card: Omit<StudyCard, "id" | "createdAt" | "updatedAt">) {
    const newCard: StudyCard = {
      ...card,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.cards.push(newCard)
    return newCard
  }

  async getCardsByUserId(userId: string) {
    return this.cards.filter((card) => card.userId === userId)
  }

  async updateCard(id: string, updates: Partial<StudyCard>) {
    const index = this.cards.findIndex((card) => card.id === id)
    if (index !== -1) {
      this.cards[index] = {
        ...this.cards[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      return this.cards[index]
    }
    return null
  }

  async deleteCard(id: string) {
    const index = this.cards.findIndex((card) => card.id === id)
    if (index !== -1) {
      return this.cards.splice(index, 1)[0]
    }
    return null
  }
}

export const db = new MockDatabase()
