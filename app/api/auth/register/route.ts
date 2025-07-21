import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "姓名、邮箱和密码都是必填项" }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度至少为6位" }, { status: 400 });
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // 生成JWT token
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    // 返回用户信息（不包含密码）
    const userWithoutPassword = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      image: newUser.image,
      subscription: newUser.subscription,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "注册成功"
    }, { status: 201 });

    // 设置HTTP-only cookie，自动登录
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("注册API错误:", error);
    return NextResponse.json(
      { error: "内部服务器错误" },
      { status: 500 },
    );
  }
}
