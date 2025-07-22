"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Calendar, Trophy, Star } from "lucide-react"
import { useStreak } from "@/hooks/use-streak"
import { useToast } from "@/hooks/use-toast"

export function StreakDisplay() {
  const { streak, isLoading, updateStreak } = useStreak()
  const [showCelebration, setShowCelebration] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // 页面加载时更新连续天数
    const handleStreakUpdate = async () => {
      const result = await updateStreak()
      if (result?.isNewRecord) {
        setShowCelebration(true)
        toast({
          title: "🎉 连续使用新纪录！",
          description: `恭喜你已经连续使用 ${result.days} 天了！`,
          duration: 5000,
        })
        
        // 3秒后隐藏庆祝动画
        setTimeout(() => setShowCelebration(false), 3000)
      }
    }

    handleStreakUpdate()
  }, [])

  const getStreakLevel = (days: number) => {
    if (days >= 30) return { level: "传奇", color: "bg-purple-500", icon: Trophy }
    if (days >= 14) return { level: "专家", color: "bg-blue-500", icon: Star }
    if (days >= 7) return { level: "进阶", color: "bg-green-500", icon: Flame }
    if (days >= 3) return { level: "入门", color: "bg-yellow-500", icon: Calendar }
    return { level: "新手", color: "bg-gray-500", icon: Calendar }
  }

  const getMotivationalMessage = (days: number) => {
    if (days === 0) return "开始你的学习之旅！"
    if (days === 1) return "很好的开始！"
    if (days < 7) return "保持下去，你做得很棒！"
    if (days < 14) return "一周连续学习，真是太棒了！"
    if (days < 30) return "你的坚持令人钦佩！"
    return "你是真正的学习大师！"
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>
            <div className="animate-pulse bg-muted h-4 w-16 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const streakInfo = getStreakLevel(streak)
  const IconComponent = streakInfo.icon

  return (
    <Card className={`w-full transition-all duration-300 ${showCelebration ? 'ring-2 ring-yellow-400 shadow-lg' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconComponent className={`h-5 w-5 ${showCelebration ? 'animate-bounce' : ''}`} />
          连续学习
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${showCelebration ? 'animate-pulse text-yellow-600' : ''}`}>
                {streak}
              </div>
              <div className="text-sm text-muted-foreground">天</div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`${streakInfo.color} text-white`}>
                {streakInfo.level}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {getMotivationalMessage(streak)}
              </p>
            </div>
          </div>
          
          {/* 火焰图标显示连续程度 */}
          <div className="flex items-center">
            {Array.from({ length: Math.min(streak, 7) }, (_, i) => (
              <Flame 
                key={i} 
                className={`h-4 w-4 ${
                  i < streak 
                    ? 'text-orange-500 fill-current' 
                    : 'text-gray-300'
                } ${showCelebration ? 'animate-pulse' : ''}`} 
              />
            ))}
            {streak > 7 && (
              <span className="ml-1 text-sm font-medium text-orange-500">
                +{streak - 7}
              </span>
            )}
          </div>
        </div>

        {/* 里程碑提示 */}
        {streak > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>下个里程碑:</span>
              <span>
                {streak < 3 && "3天 (入门)"}
                {streak >= 3 && streak < 7 && "7天 (进阶)"}
                {streak >= 7 && streak < 14 && "14天 (专家)"}
                {streak >= 14 && streak < 30 && "30天 (传奇)"}
                {streak >= 30 && "你已经是传奇了！"}
              </span>
            </div>
            {streak < 30 && (
              <div className="mt-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ 
                    width: `${
                      streak < 3 ? (streak / 3) * 100 :
                      streak < 7 ? ((streak - 3) / 4) * 100 :
                      streak < 14 ? ((streak - 7) / 7) * 100 :
                      streak < 30 ? ((streak - 14) / 16) * 100 : 100
                    }%` 
                  }}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
