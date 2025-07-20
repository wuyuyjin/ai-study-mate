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
import { Loader2, Sparkles, FileText, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GeneratedCard {
  title: string
  tags: string[]
  content: string
  qa: {
    question: string
    answer: string
  }
}

export function CreateCardForm() {
  const [inputText, setInputText] = useState("")
  const [extractMode, setExtractMode] = useState<"cards" | "qa">("cards")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
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
      setGeneratedCards(data.cards)

      toast({
        title: "生成成功！",
        description: `已生成 ${data.cards.length} 张知识卡片`,
      })
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

  const handleSaveCards = async () => {
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cards: generatedCards }),
      })

      if (!response.ok) {
        throw new Error("保存失败")
      }

      toast({
        title: "保存成功！",
        description: "知识卡片已保存到你的学习库",
      })

      // 重置表单
      setInputText("")
      setGeneratedCards([])
      setCustomTags([])
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* 生成结果 */}
      {generatedCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>生成的知识卡片</CardTitle>
            <CardDescription>AI 已为你生成了 {generatedCards.length} 张知识卡片，你可以编辑后保存</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedCards.map((card, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <div className="flex gap-1">
                      {card.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">知识内容</h4>
                    <p className="text-sm text-muted-foreground">{card.content}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">问答测试</h4>
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
                </CardContent>
              </Card>
            ))}

            <Button onClick={handleSaveCards} className="w-full" size="lg">
              保存所有卡片
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
