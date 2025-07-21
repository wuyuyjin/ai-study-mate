import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
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

        {/* Reset Password Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">重置密码</CardTitle>
            <CardDescription className="text-center">
              请输入您的新密码
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            记起密码了？{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              返回登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
