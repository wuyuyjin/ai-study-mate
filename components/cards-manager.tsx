"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, BookOpen, Edit, Trash2, Star, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface StudyCard {
  id: string
  title: string
  tags: string[]
  content: string
  qa: {
    question: string
    answer: string
  }
  createdAt: string
  reviewCount: number
  difficulty: "easy" | "medium" | "hard"
  isFavorite: boolean
}

export function CardsManager() {
  const [cards, setCards] = useState<StudyCard[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    // 模拟数据加载
    const mockCards: StudyCard[] = [
      {
        id: "1",
        title: "牛顿第一定律",
        tags: ["物理", "力学"],
        content: "物体在不受外力作用时将保持静止或匀速直线运动状态。这个定律也被称为惯性定律，是经典力学的基础。",
        qa: {
          question: "牛顿第一定律的核心内容是什么？",
          answer: "物体在不受外力时保持原运动状态。",
        },
        createdAt: "2024-01-20",
        reviewCount: 3,
        difficulty: "medium",
        isFavorite: true,
      },
      {
        id: "2",
        title: "React Hooks",
        tags: ["编程", "React", "JavaScript"],
        content:
          "React Hooks 是 React 16.8 引入的新特性，允许在函数组件中使用状态和其他 React 特性。常用的 Hooks 包括 useState、useEffect、useContext 等。",
        qa: {
          question: "React Hooks 的主要作用是什么？",
          answer: "允许在函数组件中使用状态和其他 React 特性。",
        },
        createdAt: "2024-01-19",
        reviewCount: 1,
        difficulty: "hard",
        isFavorite: false,
      },
      {
        id: "3",
        title: "数据结构 - 栈",
        tags: ["计算机科学", "数据结构"],
        content:
          "栈是一种后进先出（LIFO）的数据结构。只能在栈顶进行插入和删除操作。常用操作包括 push（入栈）和 pop（出栈）。",
        qa: {
          question: "栈的特点是什么？",
          answer: "后进先出（LIFO），只能在栈顶操作。",
        },
        createdAt: "2024-01-18",
        reviewCount: 5,
        difficulty: "easy",
        isFavorite: false,
      },
    ]

    setCards(mockCards)

    // 提取所有标签
    const tags = Array.from(new Set(mockCards.flatMap((card) => card.tags)))
    setAllTags(tags)
  }, [])

  const filteredCards = cards
    .filter((card) => {
      const matchesSearch =
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTag = selectedTag === "all" || card.tags.includes(selectedTag)

      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "most-reviewed":
          return b.reviewCount - a.reviewCount
        case "least-reviewed":
          return a.reviewCount - b.reviewCount
        case "favorites":
          return b.isFavorite ? 1 : -1
        default:
          return 0
      }
    })

  const toggleFavorite = (cardId: string) => {
    setCards(cards.map((card) => (card.id === cardId ? { ...card, isFavorite: !card.isFavorite } : card)))
  }

  const deleteCard = (cardId: string) => {
    setCards(cards.filter((card) => card.id !== cardId))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">我的学习卡片</h1>
          <p className="text-muted-foreground">
            共 {cards.length} 张卡片，已筛选 {filteredCards.length} 张
          </p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索卡片标题、内容或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="选择标签" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有标签</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新创建</SelectItem>
                <SelectItem value="oldest">最早创建</SelectItem>
                <SelectItem value="most-reviewed">复习最多</SelectItem>
                <SelectItem value="least-reviewed">复习最少</SelectItem>
                <SelectItem value="favorites">收藏优先</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 卡片列表 */}
      {filteredCards.length > 0 ? (
        <div className="grid gap-4">
          {filteredCards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      {card.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {card.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
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
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleFavorite(card.id)}>
                        <Star className="h-4 w-4 mr-2" />
                        {card.isFavorite ? "取消收藏" : "添加收藏"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        编辑卡片
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteCard(card.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除卡片
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{card.content}</p>

                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    问答测试
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-primary">问题：</span>
                      <p className="text-sm">{card.qa.question}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-primary">答案：</span>
                      <p className="text-sm text-muted-foreground">{card.qa.answer}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>创建于 {card.createdAt}</span>
                  <span>已复习 {card.reviewCount} 次</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">没有找到匹配的卡片</h3>
            <p className="text-muted-foreground mb-4">尝试调整搜索条件或创建新的学习卡片</p>
            <Button asChild>
              <a href="/create">创建新卡片</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
