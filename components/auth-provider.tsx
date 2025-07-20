"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  signIn: (userData?: User) => void
  signOut: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const userData = await response.json()
          if (userData.success && userData.user) {
            setUser(userData.user)
          }
        }
      }
    } catch (error) {
      console.error("检查认证状态失败:", error)
      // 如果API调用失败，检查localStorage中是否有用户信息（兼容旧版本）
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          localStorage.removeItem("user")
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = (userData?: User) => {
    if (userData) {
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } else {
      // 兼容旧的模拟登录
      const mockUser: User = {
        id: "1",
        name: "学习者",
        email: "learner@example.com",
      }
      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("退出登录失败:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("user")
    }
  }

  return <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext }
