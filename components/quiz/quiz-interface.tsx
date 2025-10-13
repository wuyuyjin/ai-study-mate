"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Brain, Clock, CheckCircle, ArrowRight, ArrowLeft, RotateCcw, ArrowLeft as BackIcon } from "lucide-react"
import Link from "next/link"

interface QuizQuestion {
  id: string
  questionNumber: number
  title: string
  content: string
  question: string
  standardAnswer: string
  tags: string[]
  difficulty: string
  userAnswer: string
}

interface Quiz {
  id: string
  totalQuestions: number
  questions: QuizQuestion[]
  startTime: string
}

export function QuizInterface() {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const { toast } = useToast()

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStarted && !isCompleted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStarted, isCompleted, startTime])

  const startQuiz = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/quiz/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "开始测验失败")
      }

      const data = await response.json()
      setQuiz(data.quiz)
      setIsStarted(true)
      setStartTime(new Date())
      setCurrentQuestionIndex(0)

      toast({
        title: "测验开始！",
        description: `共 ${data.quiz.totalQuestions} 道题目，加油！`,
      })
    } catch (error) {
      toast({
        title: "开始测验失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateAnswer = (answer: string) => {
    if (!quiz) return

    const updatedQuestions = [...quiz.questions]
    updatedQuestions[currentQuestionIndex].userAnswer = answer
    setQuiz({ ...quiz, questions: updatedQuestions })
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitQuiz = async () => {
    if (!quiz) return

    // 检查是否有未回答的题目
    const unansweredQuestions = quiz.questions.filter(q => !q.userAnswer.trim())
    if (unansweredQuestions.length > 0) {
      const proceed = confirm(`还有 ${unansweredQuestions.length} 道题目未回答，确定要提交吗？`)
      if (!proceed) return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/quiz/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: quiz.questions,
        }),
      })

      if (!response.ok) {
        throw new Error("提交测验失败")
      }

      const data = await response.json()
      setIsCompleted(true)

      // 将结果存储到localStorage，供结果页面使用
      localStorage.setItem("quizResult", JSON.stringify({
        quiz,
        analysis: data.analysis,
        elapsedTime,
        completedAt: data.completedAt,
      }))

      toast({
        title: "测验完成！",
        description: "正在分析您的答案...",
      })

      // 跳转到结果页面
      window.location.href = "/quiz/result"
    } catch (error) {
      toast({
        title: "提交失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetQuiz = () => {
    setQuiz(null)
    setIsStarted(false)
    setIsCompleted(false)
    setCurrentQuestionIndex(0)
    setStartTime(null)
    setElapsedTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = quiz?.questions[currentQuestionIndex]
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.totalQuestions) * 100 : 0

  if (!isStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl">记忆测验</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            凭记忆回答问题，检验您的学习成果
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 space-y-2 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-amber-800 dark:text-amber-200 text-sm sm:text-base">记忆测验说明：</h3>
            </div>
            <ul className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• 系统将从您的卡片库中随机选择最多10张卡片</li>
              <li>• <strong>请凭记忆回答问题，不要查看任何资料</strong></li>
              <li>• 即使不确定也请尽量回答，部分正确也会得分</li>
              <li>• AI将给予鼓励性的反馈和学习建议</li>
              <li>• 建议在安静的环境中专心完成</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <BackIcon className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
            <Button
              onClick={startQuiz}
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? "准备中..." : "开始测验"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentQuestion) {
    return <div>加载中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 进度和计时器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{formatTime(elapsedTime)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {quiz.totalQuestions}
            </div>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </CardContent>
      </Card>

      {/* 题目卡片 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">
              题目 {currentQuestion.questionNumber}: {currentQuestion.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant={
                currentQuestion.difficulty === "easy" ? "secondary" :
                  currentQuestion.difficulty === "medium" ? "default" : "destructive"
              }>
                {currentQuestion.difficulty === "easy" ? "简单" :
                  currentQuestion.difficulty === "medium" ? "中等" : "困难"}
              </Badge>
              {Array.from(new Set(currentQuestion.tags)).map((tag, tagIndex) => (
                <Badge key={`${currentQuestion.id}-${tagIndex}`} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">记忆测验</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              请凭记忆回答以下问题，不要查看任何资料。这是检验您学习效果的好机会！
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-lg sm:text-xl">{currentQuestion.question}</h4>
            <Textarea
              value={currentQuestion.userAnswer}
              onChange={(e) => updateAnswer(e.target.value)}
              placeholder="请凭记忆输入您的答案..."
              rows={6}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 提示：尽量详细地回答，即使不确定也可以写出您记得的部分
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 导航按钮 */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <BackIcon className="h-4 w-4 mr-2" />
              返回首页
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            上一题
          </Button>

          {currentQuestionIndex < quiz.totalQuestions - 1 ? (
            <Button onClick={nextQuestion} className="w-full sm:w-auto">
              下一题
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={submitQuiz} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "提交中..." : "完成测验"}
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        <Button variant="outline" onClick={resetQuiz} className="w-full sm:w-auto">
          <RotateCcw className="h-4 w-4 mr-2" />
          重新开始
        </Button>
      </div>
    </div>
  )
}
