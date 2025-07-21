"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface AuthRedirectProps {
  children: React.ReactNode
  redirectTo?: string
  redirectIfAuthenticated?: boolean
}

export function AuthRedirect({ 
  children, 
  redirectTo = "/", 
  redirectIfAuthenticated = false 
}: AuthRedirectProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (redirectIfAuthenticated && user) {
        // 如果已登录且需要重定向已认证用户，则重定向
        router.push(redirectTo)
      }
    }
  }, [user, isLoading, router, redirectTo, redirectIfAuthenticated])

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">检查登录状态...</p>
        </div>
      </div>
    )
  }

  // 如果已登录且需要重定向，显示重定向提示
  if (redirectIfAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">您已登录，正在跳转...</p>
        </div>
      </div>
    )
  }

  // 显示内容
  return <>{children}</>
}
