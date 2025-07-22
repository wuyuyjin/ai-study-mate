"use client"

import { Button } from "@/components/ui/button"
import { Brain, Plus, User, Settings, LogOut, Heart } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const { user, signIn, signOut } = useAuth()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">AI StudyMate</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/cards" className="text-sm font-medium hover:text-primary">
            我的卡片
          </Link>
          <Link href="/favorites" className="text-sm font-medium hover:text-primary flex items-center gap-1">
            <Heart className="h-4 w-4" />
            收藏卡片
          </Link>
          <Link href="/quiz" className="text-sm font-medium hover:text-primary">
            记忆测验
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button asChild size="sm">
            <Link href="/create">
              <Plus className="h-4 w-4 mr-2" />
              新建卡片
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && <p className="font-medium">{user.name}</p>}
                    {user.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    设置
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/login">
                <User className="h-4 w-4 mr-2" />
                登录
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
