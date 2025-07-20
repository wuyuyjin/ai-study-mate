"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Crown, Download, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">设置</h1>
        <p className="text-muted-foreground">管理你的账户设置和偏好</p>
      </div>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            账户信息
          </CardTitle>
          <CardDescription>你的基本账户信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{user?.name || "未登录"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订阅状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            订阅状态
          </CardTitle>
          <CardDescription>你的当前订阅计划和使用情况</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">免费计划</h3>
              <p className="text-sm text-muted-foreground">每日限制使用</p>
            </div>
            <Badge variant="outline">免费用户</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>今日卡片生成</span>
              <span>3/10</span>
            </div>
            <Progress value={30} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>今日测验次数</span>
              <span>2/5</span>
            </div>
            <Progress value={40} className="h-2" />
          </div>

          <Button className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            升级到专业版
          </Button>
        </CardContent>
      </Card>

      {/* 应用设置 */}
      <Card>
        <CardHeader>
          <CardTitle>应用设置</CardTitle>
          <CardDescription>自定义你的学习体验</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">深色模式</Label>
              <div className="text-sm text-muted-foreground">切换应用的外观主题</div>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">学习提醒</Label>
              <div className="text-sm text-muted-foreground">接收每日学习提醒通知</div>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">自动保存</Label>
              <div className="text-sm text-muted-foreground">自动保存学习进度和设置</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle>数据管理</CardTitle>
          <CardDescription>导出或删除你的学习数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              导出学习数据
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              导出为 Markdown
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium text-destructive">危险操作</h4>
            <p className="text-sm text-muted-foreground">以下操作不可撤销，请谨慎操作</p>
            <Button variant="destructive" className="justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              删除所有数据
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
