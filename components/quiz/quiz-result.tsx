"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Brain,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Home,
  Target
} from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils/date"

interface QuizResultData {
  quiz: any
  analysis: any
  elapsedTime: number
  completedAt: string
}

export function QuizResult() {
  const [resultData, setResultData] = useState<QuizResultData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // 从localStorage获取测验结果
    const savedResult = localStorage.getItem("quizResult")
    if (savedResult) {
      try {
        const data = JSON.parse(savedResult)
        setResultData(data)
      } catch (error) {
        console.error("解析测验结果失败:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs}秒`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-8 w-8 text-yellow-500" />
    if (score >= 60) return <Target className="h-8 w-8 text-blue-500" />
    return <Brain className="h-8 w-8 text-gray-500" />
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载测验结果中...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!resultData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">没有找到测验结果</h3>
            <p className="text-muted-foreground mb-4">请先完成一次测验</p>
            <Link href="/quiz">
              <Button>开始测验</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { quiz, analysis, elapsedTime } = resultData

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 总体结果卡片 */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {getScoreIcon(analysis.overallScore)}
          </div>
          <CardTitle className="text-3xl">测验完成！</CardTitle>
          <CardDescription>
            您已完成记忆测验，以下是详细的分析结果
            <br />
            <span className="text-xs text-muted-foreground">
              完成时间：{isMounted ? formatDateTime(resultData.completedAt) : new Date(resultData.completedAt).toLocaleString('zh-CN')}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <div className="text-sm text-muted-foreground">总分</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {analysis.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">正确答案</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {analysis.totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">总题数</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-sm text-muted-foreground">用时</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">正确率</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((analysis.correctAnswers / analysis.totalQuestions) * 100)}%
              </span>
            </div>
            <Progress
              value={(analysis.correctAnswers / analysis.totalQuestions) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* 详细分析 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">总体分析</TabsTrigger>
          <TabsTrigger value="questions">题目详情</TabsTrigger>
          <TabsTrigger value="suggestions">学习建议</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  优势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  需要改进
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>整体反馈</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{analysis.overallFeedback}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {analysis.analysis.map((item: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    题目 {item.questionNumber}: {item.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.isCorrect ? "default" : "destructive"}>
                      {item.score}/10分
                    </Badge>
                    {item.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">问题：</h4>
                  <p className="text-sm text-muted-foreground">{item.question}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">您的答案：</h4>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">{item.userAnswer || "未回答"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">标准答案：</h4>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                      <p className="text-sm">{item.standardAnswer}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">AI反馈：</h4>
                  <p className="text-sm text-muted-foreground">{item.feedback}</p>
                </div>

                {item.keyPoints && item.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">关键要点：</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {item.keyPoints.map((point: string, pointIndex: number) => (
                        <li key={pointIndex} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                学习建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span className="text-sm leading-relaxed">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 操作按钮 */}
      <div className="flex gap-4 justify-center">
        <Link href="/quiz">
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            再次测验
          </Button>
        </Link>
        <Link href="/cards">
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            查看卡片
          </Button>
        </Link>
        <Link href="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  )
}
