"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Brain, CheckCircle, XCircle, RotateCcw, Target, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuizCard {
  id: string
  title: string
  tags: string[]
  question: string
  answer: string
  difficulty: "easy" | "medium" | "hard"
}

type MemoryLevel = "perfect" | "good" | "fuzzy" | "forgot"

export function QuizInterface() {
  const [quizCards, setQuizCards] = useState<QuizCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState("")
  const [quizResults, setQuizResults] = useState<{ cardId: string; level: MemoryLevel }[]>([])
  const [isQuizComplete, setIsQuizComplete] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // 模拟加载测验卡片
    const mockQuizCards: QuizCard[] = [
      {
        id: "1",
        title: "牛顿第一定律",
        tags: ["物理", "力学"],
        question: "牛顿第一定律的核心内容是什么？请详细解释。",
        answer:
          "物体在不受外力作用时将保持静止或匀速直线运动状态。这个定律也被称为惯性定律，说明了物体具有保持原有运动状态的性质。",
        difficulty: "medium",
      },
      {
        id: "2",
        title: "React Hooks",
        tags: ["编程", "React"],
        question: "useState Hook 的作用是什么？如何使用？",
        answer:
          "useState 是 React Hook，用于在函数组件中添加状态。使用方式：const [state, setState] = useState(initialValue)，返回当前状态值和更新状态的函数。",
        difficulty: "hard",
      },
      {
        id: "3",
        title: "数据结构 - 栈",
        tags: ["计算机科学", "数据结构"],
        question: "栈数据结构的主要特点和基本操作有哪些？",
        answer:
          "栈是后进先出（LIFO）的数据结构。基本操作包括：push（入栈）、pop（出栈）、peek/top（查看栈顶元素）、isEmpty（判断是否为空）。",
        difficulty: "easy",
      },
    ]

    setQuizCards(mockQuizCards)
  }, [])

  const currentCard = quizCards[currentIndex]
  const progress = quizCards.length > 0 ? ((currentIndex + 1) / quizCards.length) * 100 : 0

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleMemoryFeedback = (level: MemoryLevel) => {
    const newResult = { cardId: currentCard.id, level }
    const updatedResults = [...quizResults, newResult]
    setQuizResults(updatedResults)

    if (currentIndex < quizCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
      setUserAnswer("")
    } else {
      setIsQuizComplete(true)
      toast({
        title: "测验完成！",
        description: `你已完成所有 ${quizCards.length} 张卡片的测验`,
      })
    }
  }

  const resetQuiz = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setUserAnswer("")
    setQuizResults([])
    setIsQuizComplete(false)
  }

  const getMemoryStats = () => {
    const stats = {
      perfect: quizResults.filter((r) => r.level === "perfect").length,
      good: quizResults.filter((r) => r.level === "good").length,
      fuzzy: quizResults.filter((r) => r.level === "fuzzy").length,
      forgot: quizResults.filter((r) => r.level === "forgot").length,
    }
    return stats
  }

  if (quizCards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无可测验的卡片</h3>
            <p className="text-muted-foreground mb-4">请先创建一些学习卡片，然后回来进行记忆测验</p>
            <Button asChild>
              <a href="/create">创建学习卡片</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isQuizComplete) {
    const stats = getMemoryStats()
    const totalCards = quizCards.length
    const masteredCards = stats.perfect + stats.good
    const masteryRate = Math.round((masteredCards / totalCards) * 100)

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <CardTitle className="text-2xl">测验完成！</CardTitle>
            <CardDescription>恭喜你完成了本次记忆测验</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{masteryRate}%</div>
              <p className="text-muted-foreground">掌握率</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.perfect}</div>
                <p className="text-sm text-green-600 dark:text-green-400">完全掌握</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.good}</div>
                <p className="text-sm text-blue-600 dark:text-blue-400">基本掌握</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.fuzzy}</div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">模糊记忆</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.forgot}</div>
                <p className="text-sm text-red-600 dark:text-red-400">需要复习</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={resetQuiz} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                重新测验
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <a href="/cards">
                  <Target className="h-4 w-4 mr-2" />
                  复习卡片
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">记忆测验</h1>
        <p className="text-muted-foreground">测试你对知识点的掌握程度，诚实评估记忆情况</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">
              {currentIndex + 1} / {quizCards.length}
            </Badge>
            <div className="flex gap-1">
              {currentCard.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {currentCard.title}
          </CardTitle>
          <Badge
            variant={
              currentCard.difficulty === "easy"
                ? "secondary"
                : currentCard.difficulty === "medium"
                  ? "default"
                  : "destructive"
            }
            className="w-fit"
          >
            {currentCard.difficulty === "easy" ? "简单" : currentCard.difficulty === "medium" ? "中等" : "困难"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">问题：</h3>
            <p className="text-sm">{currentCard.question}</p>
          </div>

          {!showAnswer ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">你的回答（可选）：</label>
                <Textarea
                  placeholder="在这里写下你的答案，然后点击查看标准答案..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={handleShowAnswer} className="w-full">
                查看答案
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-primary">标准答案：</h3>
                <p className="text-sm">{currentCard.answer}</p>
              </div>

              <div>
                <h3 className="font-medium mb-3">请评估你的记忆情况：</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleMemoryFeedback("perfect")}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">完全掌握</div>
                      <div className="text-xs text-muted-foreground">答案完全正确</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleMemoryFeedback("good")}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">基本掌握</div>
                      <div className="text-xs text-muted-foreground">大部分正确</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleMemoryFeedback("fuzzy")}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-yellow-50 hover:border-yellow-200 dark:hover:bg-yellow-950"
                  >
                    <XCircle className="h-5 w-5 text-yellow-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">模糊记忆</div>
                      <div className="text-xs text-muted-foreground">有印象但不清楚</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleMemoryFeedback("forgot")}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950"
                  >
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">完全遗忘</div>
                      <div className="text-xs text-muted-foreground">完全不记得</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
