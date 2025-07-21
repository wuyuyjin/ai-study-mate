import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码是必填项" }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
    }

    // 比较密码
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
    }

    // 生成JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const expiresIn = rememberMe ? "30d" : "7d";
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });

    // 创建响应
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      subscription: user.subscription,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "登录成功"
    }, { status: 200 });

    // 设置HTTP-only cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30天或7天
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("登录API错误:", error);
    return NextResponse.json(
      { error: "内部服务器错误" },
      { status: 500 },
    );
  }
}
