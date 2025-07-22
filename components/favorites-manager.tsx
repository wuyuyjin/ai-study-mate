"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Star, Edit, Trash2, MoreHorizontal, Heart, BookOpen } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { EditCardDialog } from "./edit-card-dialog"

interface StudyCard {
  id: string
  title: string
  content: string
  question: string
  answer: string
  tags: string[]
  difficulty: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function FavoritesManager() {
  const [cards, setCards] = useState<StudyCard[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [editingCard, setEditingCard] = useState<StudyCard | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadFavoriteCards()
  }, [pagination.currentPage, searchQuery, selectedTag, sortBy])

  const loadFavoriteCards = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchQuery,
        tag: selectedTag,
        sortBy: sortBy,
      })

      const response = await fetch(`/api/cards/favorites?${params}`)
      if (!response.ok) {
        throw new Error("获取收藏卡片失败")
      }

      const data = await response.json()
      setCards(data.cards)
      setPagination(data.pagination)

      // 提取所有标签
      const tags = new Set<string>()
      data.cards.forEach((card: StudyCard) => {
        card.tags.forEach((tag: string) => tags.add(tag))
      })
      setAllTags(Array.from(tags))
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载收藏的卡片，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (cardId: string) => {
    try {
      const response = await fetch("/api/cards/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId, isFavorite: false }),
      })

      if (!response.ok) {
        throw new Error("操作失败")
      }

      // 从列表中移除该卡片
      setCards(cards.filter(card => card.id !== cardId))
      setPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }))

      toast({
        title: "已取消收藏",
        description: "卡片已从收藏列表中移除",
      })
    } catch (error) {
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const deleteCard = async (cardId: string) => {
    if (!confirm("确定要删除这张卡片吗？此操作不可撤销。")) {
      return
    }

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("删除失败")
      }

      setCards(cards.filter(card => card.id !== cardId))
      setPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }))

      toast({
        title: "删除成功",
        description: "卡片已成功删除",
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleEditCard = (card: StudyCard) => {
    setEditingCard(card)
    setIsEditDialogOpen(true)
  }

  const handleCardUpdated = (updatedCard: StudyCard) => {
    setCards(cards.map(card => card.id === updatedCard.id ? updatedCard : card))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "hard": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "简单"
      case "medium": return "中等"
      case "hard": return "困难"
      default: return "中等"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载收藏卡片中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 text-red-500" />
        <h1 className="text-2xl font-bold">我的收藏</h1>
        <Badge variant="secondary">{pagination.totalCount} 张卡片</Badge>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索收藏的卡片..."
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
                <SelectItem value="title">标题排序</SelectItem>
                <SelectItem value="difficulty">难度排序</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 卡片列表 */}
      {cards.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无收藏卡片</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedTag !== "all" 
                  ? "没有找到符合条件的收藏卡片" 
                  : "您还没有收藏任何卡片，去创建一些卡片并收藏它们吧！"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {card.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <Badge className={`text-xs ${getDifficultyColor(card.difficulty)}`}>
                          {getDifficultyText(card.difficulty)}
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
                        <DropdownMenuItem onClick={() => handleEditCard(card)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑卡片
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFavorite(card.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          取消收藏
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
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {card.content}
                  </p>
                  {card.question && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">问题：</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{card.question}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  {pagination.hasPrevPage && (
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === pagination.currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {pagination.hasNextPage && (
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* 编辑对话框 */}
      <EditCardDialog
        card={editingCard}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onCardUpdated={handleCardUpdated}
      />
    </div>
  )
}
