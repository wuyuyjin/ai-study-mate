"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StudyCard {
  id: string
  title: string
  content: string
  question: string
  answer: string
  tags: string[]
  difficulty: "easy" | "medium" | "hard"
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  reviewCount: number
}

interface EditCardDialogProps {
  card: StudyCard | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCardUpdated: (updatedCard: StudyCard) => void
}

export function EditCardDialog({ card, open, onOpenChange, onCardUpdated }: EditCardDialogProps) {
  const [formData, setFormData] = useState<StudyCard>({
    id: "",
    title: "",
    content: "",
    question: "",
    answer: "",
    tags: [],
    difficulty: "medium",
    isFavorite: false,
  })
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // 当卡片数据变化时更新表单
  useEffect(() => {
    if (card) {
      setFormData(card)
    }
  }, [card])

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "验证失败",
        description: "标题和内容不能为空",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/cards/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "更新失败")
      }

      const data = await response.json()
      onCardUpdated(data.card)
      onOpenChange(false)

      toast({
        title: "更新成功",
        description: "卡片已成功更新",
      })
    } catch (error) {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑卡片</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入卡片标题"
            />
          </div>

          {/* 内容 */}
          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="输入卡片内容"
              rows={4}
            />
          </div>

          {/* 问题和答案 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question">问题</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="输入测试问题"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">答案</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="输入问题答案"
                rows={3}
              />
            </div>
          </div>

          {/* 难度和收藏 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">难度</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="favorite">收藏状态</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="favorite"
                  checked={formData.isFavorite}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFavorite: checked }))}
                />
                <Label htmlFor="favorite">{formData.isFavorite ? "已收藏" : "未收藏"}</Label>
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label>标签</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="添加标签..."
                onKeyDown={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag} size="sm">
                添加
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
