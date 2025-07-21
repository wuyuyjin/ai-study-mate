"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, FileText, Upload, X, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GeneratedCard {
  title: string
  tags: string[]
  content: string
  question?: string
  answer?: string
  difficulty?: string
  qa?: {
    question: string
    answer: string
  }
}

export function CreateCardForm() {
  const [inputText, setInputText] = useState("")
  const [extractMode, setExtractMode] = useState<"cards" | "qa">("cards")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentCard, setCurrentCard] = useState<GeneratedCard | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [defaultDifficulty, setDefaultDifficulty] = useState<string>("medium")
  const { toast } = useToast()

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)
  const [fetchedContent, setFetchedContent] = useState<{ title: string; content: string } | null>(null)

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "请输入学习材料",
        description: "请粘贴或输入要转换的学习内容",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          mode: extractMode,
          customTags,
        }),
      })

      if (!response.ok) {
        throw new Error("生成失败")
      }

      const data = await response.json()
      if (data.cards && data.cards.length > 0) {
        const card = data.cards[0]
        setCurrentCard({
          ...card,
          difficulty: card.difficulty || defaultDifficulty,
          tags: [...(card.tags || []), ...customTags]
        })
        setIsEditing(true)

        toast({
          title: "生成成功！",
          description: "已生成知识卡片，您可以编辑后保存",
        })
      } else {
        throw new Error("未生成任何卡片")
      }
    } catch (error) {
      toast({
        title: "生成失败",
        description: "请稍后重试或检查网络连接",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateRelated = async () => {
    if (!currentCard) {
      toast({
        title: "没有当前卡片",
        description: "请先生成一张卡片",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const relatedPrompt = `基于以下知识卡片内容，生成一个相关但不同角度的问题：

当前卡片：
标题：${currentCard.title}
内容：${currentCard.content}
问题：${currentCard.question}

请生成一个新的相关问题，可以是：
1. 更深入的问题
2. 应用场景的问题
3. 对比分析的问题
4. 实际操作的问题

要求生成一张新的知识卡片。`

      const response = await fetch("/api/generate-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: relatedPrompt,
          mode: extractMode,
          customTags: currentCard.tags || [],
        }),
      })

      if (!response.ok) {
        throw new Error("生成失败")
      }

      const data = await response.json()
      if (data.cards && data.cards.length > 0) {
        const newCard = data.cards[0]
        setCurrentCard({
          ...newCard,
          difficulty: newCard.difficulty || defaultDifficulty,
          tags: [...(newCard.tags || []), ...(currentCard.tags || [])]
        })

        toast({
          title: "生成相关问题成功！",
          description: "已生成新的相关问题，您可以编辑后保存",
        })
      } else {
        throw new Error("未生成任何卡片")
      }
    } catch (error) {
      toast({
        title: "生成相关问题失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveCard = async () => {
    if (!currentCard) {
      toast({
        title: "没有卡片可保存",
        description: "请先生成一张卡片",
        variant: "destructive",
      })
      return
    }

    try {
      const cardToSave = {
        title: currentCard.title,
        content: currentCard.content,
        question: currentCard.question || currentCard.qa?.question || "",
        answer: currentCard.answer || currentCard.qa?.answer || "",
        tags: currentCard.tags || [],
        difficulty: currentCard.difficulty || defaultDifficulty,
      }

      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cards: [cardToSave] }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 403 && errorData.limit) {
          // 卡片数量限制错误
          toast({
            title: "卡片数量已达上限",
            description: errorData.message || `免费用户最多只能创建${errorData.limit}张卡片`,
            variant: "destructive",
          })
          return
        }

        throw new Error(errorData.error || "保存失败")
      }

      const data = await response.json()

      toast({
        title: "保存成功！",
        description: "知识卡片已保存到你的学习库",
      })

      // 重置表单
      setCurrentCard(null)
      setIsEditing(false)
      setInputText("")
      setCustomTags([])
      setUploadedFile(null)
      setFetchedContent(null)
      setUrlInput("")
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const addCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "文件大小不能超过 10MB",
        variant: "destructive",
      })
      return
    }

    setUploadedFile(file)
    setIsProcessingFile(true)

    try {
      // 这里可以添加文件预处理逻辑
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 模拟处理时间

      toast({
        title: "文件上传成功",
        description: `已成功上传 ${file.name}`,
      })
    } catch (error) {
      toast({
        title: "文件处理失败",
        description: "请检查文件格式是否正确",
        variant: "destructive",
      })
      setUploadedFile(null)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleGenerateFromFile = async () => {
    if (!uploadedFile) return

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)
      formData.append("mode", extractMode)
      formData.append("customTags", JSON.stringify(customTags))

      const response = await fetch("/api/generate-cards-from-file", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("生成失败")
      }

      const data = await response.json()
      setGeneratedCards(data.cards)

      toast({
        title: "生成成功！",
        description: `已从文件生成 ${data.cards.length} 张知识卡片`,
      })
    } catch (error) {
      toast({
        title: "生成失败",
        description: "请稍后重试或检查文件内容",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return

    setIsFetchingUrl(true)

    try {
      const response = await fetch("/api/fetch-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }),
      })

      if (!response.ok) {
        throw new Error("获取网页内容失败")
      }

      const data = await response.json()
      setFetchedContent(data)

      toast({
        title: "获取成功！",
        description: "已成功获取网页内容",
      })
    } catch (error) {
      toast({
        title: "获取失败",
        description: "请检查网址是否正确或稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsFetchingUrl(false)
    }
  }

  const handleGenerateFromUrl = async () => {
    if (!fetchedContent) return

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `标题: ${fetchedContent.title}\n\n内容: ${fetchedContent.content}`,
          mode: extractMode,
          customTags,
        }),
      })

      if (!response.ok) {
        throw new Error("生成失败")
      }

      const data = await response.json()
      setGeneratedCards(data.cards)

      toast({
        title: "生成成功！",
        description: `已从网页生成 ${data.cards.length} 张知识卡片`,
      })
    } catch (error) {
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">
            <FileText className="h-4 w-4 mr-2" />
            文本输入
          </TabsTrigger>
          <TabsTrigger value="file">
            <Upload className="h-4 w-4 mr-2" />
            文件上传
          </TabsTrigger>
          <TabsTrigger value="url">
            <FileText className="h-4 w-4 mr-2" />
            网页链接
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>输入学习材料</CardTitle>
              <CardDescription>粘贴你想要学习的文本内容，支持课程笔记、文章、教材等</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">学习内容</Label>
                <Textarea
                  id="content"
                  placeholder="在这里粘贴你的学习材料..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mode">提取模式</Label>
                  <Select value={extractMode} onValueChange={(value: "cards" | "qa") => setExtractMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cards">重点卡片提取</SelectItem>
                      <SelectItem value="qa">知识问答生成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">默认难度</Label>
                  <Select value={defaultDifficulty} onValueChange={setDefaultDifficulty}>
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
                  <Label htmlFor="tags">自定义标签</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="添加标签..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                    />
                    <Button onClick={addCustomTag} size="sm">
                      添加
                    </Button>
                  </div>
                </div>
              </div>

              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCustomTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}

              <Button onClick={handleGenerate} disabled={isGenerating || !inputText.trim()} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI 正在生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成知识卡片
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>上传学习文件</CardTitle>
              <CardDescription>支持 PDF、Markdown (.md) 文件，AI 将自动提取文本内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">选择文件</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.md,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        选择文件
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">或拖拽文件到此处</p>
                    </div>
                    <p className="text-xs text-muted-foreground">支持 PDF、Markdown、TXT 文件，最大 10MB</p>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {isProcessingFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      正在处理文件...
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file-mode">提取模式</Label>
                  <Select value={extractMode} onValueChange={(value: "cards" | "qa") => setExtractMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cards">重点卡片提取</SelectItem>
                      <SelectItem value="qa">知识问答生成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-tags">自定义标签</Label>
                  <div className="flex gap-2">
                    <Input
                      id="file-tags"
                      placeholder="添加标签..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                    />
                    <Button onClick={addCustomTag} size="sm">
                      添加
                    </Button>
                  </div>
                </div>
              </div>

              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCustomTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                onClick={handleGenerateFromFile}
                disabled={!uploadedFile || isProcessingFile || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI 正在生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    从文件生成知识卡片
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>网页内容提取</CardTitle>
              <CardDescription>输入网页链接，AI 将自动提取页面内容并生成知识卡片</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-input">网页链接</Label>
                <div className="flex gap-2">
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/article"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <Button onClick={handleFetchUrl} disabled={!urlInput.trim() || isFetchingUrl} variant="outline">
                    {isFetchingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : "获取"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">支持大多数网页，包括文章、博客、文档等</p>
              </div>

              {fetchedContent && (
                <div className="space-y-2">
                  <Label>预览内容</Label>
                  <div className="bg-muted/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <h4 className="font-medium text-sm mb-2">{fetchedContent.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-6">
                      {fetchedContent.content.substring(0, 300)}...
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="url-mode">提取模式</Label>
                  <Select value={extractMode} onValueChange={(value: "cards" | "qa") => setExtractMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cards">重点卡片提取</SelectItem>
                      <SelectItem value="qa">知识问答生成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url-tags">自定义标签</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url-tags"
                      placeholder="添加标签..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                    />
                    <Button onClick={addCustomTag} size="sm">
                      添加
                    </Button>
                  </div>
                </div>
              </div>

              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCustomTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}

              <Button onClick={handleGenerateFromUrl} disabled={!fetchedContent || isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI 正在生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    从网页生成知识卡片
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 卡片编辑界面 */}
      {currentCard && isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>编辑知识卡片</CardTitle>
            <CardDescription>您可以编辑AI生成的内容，然后保存到您的学习库</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-title">卡片标题</Label>
                <Input
                  id="card-title"
                  value={currentCard.title}
                  onChange={(e) => setCurrentCard({ ...currentCard, title: e.target.value })}
                  placeholder="输入卡片标题"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-content">知识内容</Label>
                <Textarea
                  id="card-content"
                  value={currentCard.content}
                  onChange={(e) => setCurrentCard({ ...currentCard, content: e.target.value })}
                  placeholder="输入知识内容"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-question">测试问题</Label>
                  <Textarea
                    id="card-question"
                    value={currentCard.question || currentCard.qa?.question || ""}
                    onChange={(e) => setCurrentCard({
                      ...currentCard,
                      question: e.target.value,
                      qa: currentCard.qa ? { ...currentCard.qa, question: e.target.value } : undefined
                    })}
                    placeholder="输入测试问题"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-answer">标准答案</Label>
                  <Textarea
                    id="card-answer"
                    value={currentCard.answer || currentCard.qa?.answer || ""}
                    onChange={(e) => setCurrentCard({
                      ...currentCard,
                      answer: e.target.value,
                      qa: currentCard.qa ? { ...currentCard.qa, answer: e.target.value } : undefined
                    })}
                    placeholder="输入标准答案"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-difficulty">难度等级</Label>
                  <Select
                    value={currentCard.difficulty || defaultDifficulty}
                    onValueChange={(value) => setCurrentCard({ ...currentCard, difficulty: value })}
                  >
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
                  <Label>标签</Label>
                  <div className="flex flex-wrap gap-1">
                    {(currentCard.tags || []).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                        <button
                          onClick={() => {
                            const newTags = [...(currentCard.tags || [])]
                            newTags.splice(index, 1)
                            setCurrentCard({ ...currentCard, tags: newTags })
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveCard} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                保存卡片
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateRelated}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                生成相关问题
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentCard(null)
                  setIsEditing(false)
                }}
              >
                重新开始
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
