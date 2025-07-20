import { type NextRequest, NextResponse } from "next/server"

// 更智能的HTML文本提取函数
function extractTextFromHtml(html: string): string {
  // 移除script、style、nav、footer等不相关标签
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")

  // 保留段落结构
  text = text.replace(/<\/p>/gi, "\n\n")
  text = text.replace(/<br[^>]*>/gi, "\n")
  text = text.replace(/<\/h[1-6]>/gi, "\n\n")
  text = text.replace(/<\/div>/gi, "\n")
  text = text.replace(/<\/li>/gi, "\n")

  // 移除所有HTML标签
  text = text.replace(/<[^>]*>/g, " ")

  // 解码HTML实体
  text = text.replace(/&nbsp;/g, " ")
  text = text.replace(/&amp;/g, "&")
  text = text.replace(/&lt;/g, "<")
  text = text.replace(/&gt;/g, ">")
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")

  // 清理多余的空白字符
  text = text.replace(/\s+/g, " ")
  text = text.replace(/\n\s+/g, "\n")
  text = text.replace(/\n+/g, "\n\n")

  return text.trim()
}

// 更智能的标题提取
function extractTitle(html: string): string {
  // 优先从title标签提取
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch) {
    let title = titleMatch[1].replace(/<[^>]*>/g, "").trim()
    // 移除常见的网站后缀
    title = title.replace(/\s*[-|–]\s*.*$/, "")
    if (title.length > 5) return title
  }

  // 尝试从meta标签提取
  const metaTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*?)["']/i)
  if (metaTitleMatch) {
    return metaTitleMatch[1].trim()
  }

  // 尝试从h1标签提取
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1Match) {
    return h1Match[1].replace(/<[^>]*>/g, "").trim()
  }

  return "网页内容"
}

// 提取网页描述
function extractDescription(html: string): string {
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*?)["']/i)
  if (metaDescMatch) {
    return metaDescMatch[1].trim()
  }

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*?)["']/i)
  if (ogDescMatch) {
    return ogDescMatch[1].trim()
  }

  return ""
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "请提供网页链接" }, { status: 400 })
    }

    // 验证URL格式
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "无效的网页链接格式" }, { status: 400 })
    }

    // 检查协议
    if (!["http:", "https:"].includes(validUrl.protocol)) {
      return NextResponse.json({ error: "仅支持HTTP和HTTPS协议" }, { status: 400 })
    }

    // 获取网页内容
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
      },
      timeout: 10000, // 10秒超时
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `无法访问该网页 (${response.status}: ${response.statusText})`,
        },
        { status: 400 },
      )
    }

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ error: "该链接不是HTML网页" }, { status: 400 })
    }

    const html = await response.text()

    // 提取标题、描述和内容
    const title = extractTitle(html)
    const description = extractDescription(html)
    const content = extractTextFromHtml(html)

    if (!content.trim()) {
      return NextResponse.json({ error: "无法从网页中提取有效的文本内容" }, { status: 400 })
    }

    // 限制内容长度，避免过长
    const maxLength = 15000
    const truncatedContent =
      content.length > maxLength ? content.substring(0, maxLength) + "\n\n[内容已截断...]" : content

    return NextResponse.json({
      title,
      description,
      content: truncatedContent,
      url: validUrl.href,
      wordCount: content.split(/\s+/).length,
    })
  } catch (error) {
    console.error("获取网页内容失败:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json({ error: "网络连接失败，请检查网址是否正确" }, { status: 500 })
    }

    return NextResponse.json({ error: "获取网页内容失败，请稍后重试" }, { status: 500 })
  }
}
