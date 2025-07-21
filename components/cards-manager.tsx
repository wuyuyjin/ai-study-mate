"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, BookOpen, Edit, Trash2, Star, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { formatRelativeTime, formatDateTime } from "@/lib/utils/date"

interface StudyCard {
  id: string
  title: string
  tags: string[]
  content: string
  question: string
  answer: string
  createdAt: string
  updatedAt: string
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
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10) // 每页显示10张卡片

  useEffect(() => {
    setIsMounted(true)
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/cards")

      if (!response.ok) {
        throw new Error("获取卡片失败")
      }

      const data = await response.json()
      if (data.success && data.cards) {
        setCards(data.cards)

        // 提取所有标签
        const tags = new Set<string>()
        data.cards.forEach((card: StudyCard) => {
          card.tags.forEach((tag: string) => tags.add(tag))
        })
        setAllTags(Array.from(tags))
      }
    } catch (error) {
      console.error("加载卡片失败:", error)
    } finally {
      setIsLoading(false)
    }
  }



  // 过滤和排序卡片
  const filteredAndSortedCards = cards
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

  // 分页计算
  const totalCards = filteredAndSortedCards.length
  const totalPages = Math.ceil(totalCards / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentPageCards = filteredAndSortedCards.slice(startIndex, endIndex)

  // 当搜索或筛选条件改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedTag, sortBy])

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
            共 {cards.length} 张卡片，已筛选 {filteredAndSortedCards.length} 张
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
      {isLoading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载卡片中...</p>
          </CardContent>
        </Card>
      ) : totalCards > 0 ? (
        <div className="space-y-4">
          {/* 卡片统计信息 */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              显示第 {startIndex + 1}-{Math.min(endIndex, totalCards)} 条，共 {totalCards} 张卡片
            </span>
            <span>
              第 {currentPage} 页，共 {totalPages} 页
            </span>
          </div>

          {/* 卡片列表 */}
          <div className="grid gap-4">
            {currentPageCards.map((card) => (
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
                        <Badge variant="outline" className="text-xs">
                          复习 {card.reviewCount} 次
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
                        <p className="text-sm">{card.question}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-primary">答案：</span>
                        <p className="text-sm text-muted-foreground">{card.answer}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span title={isMounted ? formatDateTime(card.createdAt) : card.createdAt}>
                      创建于 {isMounted ? formatRelativeTime(card.createdAt) : new Date(card.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <span>已复习 {card.reviewCount} 次</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页组件 - 始终显示 */}
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                    }}
                    className={currentPage === 1 || totalPages <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {/* 页码显示逻辑 */}
                {totalPages > 0 && Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => {
                  // 显示逻辑：当前页前后各2页
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={(e) => {
                            e.preventDefault()
                            if (totalPages > 1) {
                              setCurrentPage(page)
                            }
                          }}
                          isActive={currentPage === page}
                          className={totalPages > 1 ? "cursor-pointer" : "cursor-default opacity-50"}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (
                    totalPages > 1 && (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    )
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <span className="px-3 py-2">...</span>
                      </PaginationItem>
                    )
                  }
                  return null
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                    }}
                    className={currentPage === totalPages || totalPages <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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
