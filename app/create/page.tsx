import { CreateCardForm } from "@/components/create-card-form"
import { Header } from "@/components/header"

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">创建知识卡片</h1>
            <p className="text-muted-foreground">粘贴学习材料，AI 将自动生成知识卡片和问答</p>
          </div>
          <CreateCardForm />
        </div>
      </main>
    </div>
  )
}
