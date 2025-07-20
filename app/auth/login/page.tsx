import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AI StudyMate</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">智能学习小助手</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">登录账户</CardTitle>
            <CardDescription className="text-center">输入你的邮箱和密码来访问你的学习空间</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">还没有账户？</span>{" "}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}
