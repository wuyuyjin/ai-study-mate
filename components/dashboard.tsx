"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, BookOpen, Target, Plus, Clock, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface StudyCard {
  id: string
  title: string
  tags: string[]
  content: string
  createdAt: string
  reviewCount: number
  difficulty: "easy" | "medium" | "hard"
}

export function Dashboard() {
  const { user } = useAuth()
  const [recentCards, setRecentCards] = useState<StudyCard[]>([])
  const [stats, setStats] = useState({
    totalCards: 0,
    todayReviews: 0,
    streak: 0,
    totalQuota: 30, // 总配额，免费用户30张
    usedQuota: 0,
    isPremiumUser: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // 并行获取卡片数据和连续天数数据
      const [cardsResponse, streakResponse] = await Promise.all([
        fetch("/api/cards"),
        fetch("/api/stats/streak")
      ])

      let totalCards = 0
      let todayReviews = 0
      let sortedCards: any[] = []

      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json()
        const cards = cardsData.cards || []

        // 计算统计信息
        totalCards = cards.length
        const today = new Date().toDateString()

        // 计算今日复习次数（简化版本，实际应该从测验记录计算）
        todayReviews = cards.reduce((sum: number, card: any) => {
          const cardDate = new Date(card.updatedAt).toDateString()
          return cardDate === today ? sum + 1 : sum
        }, 0)

        // 获取最近的卡片（最多5张）
        sortedCards = cards
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((card: any) => {
            let tags = []
            try {
              tags = JSON.parse(card.tags || '[]')
            } catch (error) {
              // 如果JSON解析失败，尝试其他格式或使用空数组
              tags = Array.isArray(card.tags) ? card.tags : []
            }

            return {
              id: card.id,
              title: card.title,
              tags,
              content: card.content,
              createdAt: card.createdAt,
              reviewCount: card.reviewCount || 0,
              difficulty: card.difficulty || 'medium'
            }
          })
      }

      // 获取连续天数数据
      let streak = 0
      if (streakResponse.ok) {
        const streakData = await streakResponse.json()
        streak = streakData.streak || 0
      }

      // 判断用户类型（简化处理，实际应该从用户数据获取）
      const isPremiumUser = user?.email?.includes('premium') || false
      const totalQuota = isPremiumUser ? null : 30 // 免费用户30张，付费用户无限

      setRecentCards(sortedCards)
      setStats({
        totalCards,
        todayReviews,
        streak,
        totalQuota,
        usedQuota: totalCards, // 已使用的配额就是总卡片数
        isPremiumUser,
      })
    } catch (error) {
      console.error("加载仪表板数据失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">欢迎使用 AI StudyMate</h2>
        <p className="text-muted-foreground mb-6">智能学习助手，将任意学习材料转化为知识卡片和问答</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">知识提取</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">粘贴文本或上传文件，AI 自动生成知识卡片和问答</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Target className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">记忆测验</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">智能问答测试，追踪记忆情况，优化复习计划</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Brain className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">学习管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">卡片分类管理，标签搜索，学习进度可视化</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">欢迎回来，{user.name}！</h1>
        <p className="text-muted-foreground">继续你的学习之旅，今天也要加油哦 🚀</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总卡片数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalCards}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日复习</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.todayReviews}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">连续天数</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.streak}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stats.isPremiumUser ? "卡片使用" : "总配额"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." :
                stats.isPremiumUser ?
                  `${stats.usedQuota}` :
                  `${stats.usedQuota}/${stats.totalQuota}`
              }
            </div>
            {!stats.isPremiumUser && stats.totalQuota && stats.usedQuota >= stats.totalQuota && (
              <p className="text-xs text-destructive mt-1">
                已达上限
              </p>
            )}
            {stats.isPremiumUser && (
              <p className="text-xs text-muted-foreground mt-1">
                无限制
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>选择一个操作开始你的学习</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" />
                创建新卡片
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/quiz">
                <Target className="h-4 w-4 mr-2" />
                开始记忆测验
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/cards">
                <BookOpen className="h-4 w-4 mr-2" />
                浏览所有卡片
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近学习</CardTitle>
            <CardDescription>你最近创建的知识卡片</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCards.length > 0 ? (
              <div className="space-y-3">
                {recentCards.map((card) => (
                  <div key={card.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{card.title}</h4>
                      <Badge
                        variant={
                          card.difficulty === "easy"
                            ? "secondary"
                            : card.difficulty === "medium"
                              ? "default"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {card.difficulty === "easy" ? "简单" : card.difficulty === "medium" ? "中等" : "困难"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{card.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {card.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">复习 {card.reviewCount} 次</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">还没有学习卡片</p>
                <p className="text-xs">创建你的第一张卡片开始学习吧！</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
