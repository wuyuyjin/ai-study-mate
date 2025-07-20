// PDF处理工具函数
// 注意：需要安装 pdf-parse 依赖
// npm install pdf-parse

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // 动态导入pdf-parse以避免构建时错误
    const pdf = await import("pdf-parse").then((m) => m.default)
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error("PDF解析失败:", error)
    // 如果PDF解析失败，返回提示信息
    return "无法解析PDF文件内容。请确保文件格式正确，或尝试将PDF转换为文本后再上传。"
  }
}

export async function extractMarkdownContent(text: string): Promise<string> {
  try {
    // 可以使用 gray-matter 来解析 frontmatter
    // 这里简单处理Markdown内容

    // 移除frontmatter
    const content = text.replace(/^---[\s\S]*?---\n/, "")

    // 保留Markdown格式，但清理一些特殊字符
    return content.trim()
  } catch (error) {
    console.error("Markdown解析失败:", error)
    return text
  }
}

export function validateFileType(file: File): boolean {
  const allowedTypes = ["application/pdf", "text/markdown", "text/plain", "text/x-markdown"]

  const allowedExtensions = [".pdf", ".md", ".txt", ".markdown"]

  const hasValidType = allowedTypes.includes(file.type)
  const hasValidExtension = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

  return hasValidType || hasValidExtension
}

export function getFileTypeFromName(fileName: string): "pdf" | "markdown" | "text" | "unknown" {
  const name = fileName.toLowerCase()

  if (name.endsWith(".pdf")) return "pdf"
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "markdown"
  if (name.endsWith(".txt")) return "text"

  return "unknown"
}
