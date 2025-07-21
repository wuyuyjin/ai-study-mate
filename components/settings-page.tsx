"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Crown, Trash2, BookOpen } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function SettingsPage() {
  const { user } = useAuth()
  const [cardStats, setCardStats] = useState({
    totalCards: 0,
    isLoading: true
  })

  // 用户类型判断（这里简化处理，实际应该从用户数据获取）
  const isPremiumUser = user?.email?.includes('premium') || false
  const cardLimit = isPremiumUser ? null : 30 // 免费用户30张，付费用户无限

  useEffect(() => {
    if (user) {
      loadCardStats()
    }
  }, [user])

  const loadCardStats = async () => {
    try {
      const response = await fetch("/api/cards")
      if (response.ok) {
        const data = await response.json()
        setCardStats({
          totalCards: data.cards?.length || 0,
          isLoading: false
        })
      }
    } catch (error) {
      console.error("加载卡片统计失败:", error)
      setCardStats(prev => ({ ...prev, isLoading: false }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">设置</h1>
        <p className="text-muted-foreground">管理你的账户设置和偏好</p>
      </div>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            账户信息
          </CardTitle>
          <CardDescription>你的基本账户信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{user?.name || "未登录"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订阅状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            订阅状态
          </CardTitle>
          <CardDescription>你的当前订阅计划和卡片使用情况</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                {isPremiumUser ? "专业版" : "免费计划"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isPremiumUser ? "无限制使用" : "限制30张卡片"}
              </p>
            </div>
            <Badge variant={isPremiumUser ? "default" : "outline"}>
              {isPremiumUser ? "专业用户" : "免费用户"}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                卡片使用情况
              </span>
              <span>
                {cardStats.isLoading ? "..." : cardStats.totalCards}
                {cardLimit ? `/${cardLimit}` : " (无限制)"}
              </span>
            </div>
            {cardLimit && (
              <Progress
                value={cardStats.isLoading ? 0 : (cardStats.totalCards / cardLimit) * 100}
                className="h-2"
              />
            )}
            {cardLimit && cardStats.totalCards >= cardLimit && (
              <p className="text-sm text-destructive">
                ⚠️ 已达到免费用户卡片上限，升级专业版解锁无限制
              </p>
            )}
          </div>

          {!isPremiumUser && (
            <Button className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              升级到专业版
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 应用设置 */}
      <Card>
        <CardHeader>
          <CardTitle>应用设置</CardTitle>
          <CardDescription>自定义你的学习体验</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">深色模式</Label>
              <div className="text-sm text-muted-foreground">切换应用的外观主题</div>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">学习提醒</Label>
              <div className="text-sm text-muted-foreground">接收每日学习提醒通知</div>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">自动保存</Label>
              <div className="text-sm text-muted-foreground">自动保存学习进度和设置</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle>数据管理</CardTitle>
          <CardDescription>管理你的学习数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">危险操作</h4>
            <p className="text-sm text-muted-foreground">以下操作不可撤销，请谨慎操作</p>
            <Button variant="destructive" className="justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              删除所有数据
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
