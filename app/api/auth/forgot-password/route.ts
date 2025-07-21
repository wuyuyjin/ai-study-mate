import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

// 配置邮件发送器
const createTransporter = () => {
  // 这里使用Gmail作为示例，你可以根据需要更换邮件服务商
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // 使用应用专用密码
    },
  });
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "邮箱是必填项" }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // 即使没有找到用户，也返回成功信息以避免泄露用户是否存在
    if (!user) {
      console.warn(`尝试重置不存在的邮箱: ${email}`);
      return NextResponse.json(
        { success: true, message: "如果邮箱存在，我们已发送密码重置链接" },
        { status: 200 },
      );
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1小时后过期

    // 更新用户的重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 发送重置邮件
    try {
      const transporter = createTransporter();
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'AI StudyMate - 密码重置',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #333; text-align: center;">密码重置请求</h2>
            <p>您好，${user.name}！</p>
            <p>我们收到了您的密码重置请求。请点击下面的链接来重置您的密码：</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                重置密码
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              此链接将在1小时后失效。如果您没有请求重置密码，请忽略此邮件。
            </p>
            <p style="color: #666; font-size: 14px;">
              如果按钮无法点击，请复制以下链接到浏览器地址栏：<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              此邮件由 AI StudyMate 自动发送，请勿回复。
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`密码重置邮件已发送到: ${email}`);
    } catch (emailError) {
      console.error('发送邮件失败:', emailError);
      // 即使邮件发送失败，也不暴露错误给用户
    }

    return NextResponse.json(
      { success: true, message: "如果邮箱存在，我们已发送密码重置链接" },
      { status: 200 },
    );
  } catch (error) {
    console.error("忘记密码API错误:", error);
    return NextResponse.json(
      { error: "内部服务器错误" },
      { status: 500 },
    );
  }
}
