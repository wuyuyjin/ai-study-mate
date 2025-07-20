import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
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

        {/* Forgot Password Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">重置密码</CardTitle>
            <CardDescription className="text-center">输入你的邮箱地址，我们将发送重置链接给你</CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center text-sm">
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}
