import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "令牌和新密码都是必填项" }, { status: 400 });
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度至少为6位" }, { status: 400 });
    }

    // 查找具有有效重置令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // 令牌未过期
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "无效或已过期的重置令牌" },
        { status: 400 }
      );
    }

    // 哈希新密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 更新用户密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { success: true, message: "密码重置成功，请使用新密码登录" },
      { status: 200 }
    );
  } catch (error) {
    console.error("密码重置API错误:", error);
    return NextResponse.json(
      { error: "内部服务器错误" },
      { status: 500 }
    );
  }
}
