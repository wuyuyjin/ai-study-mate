// 安装PDF解析依赖
// npm install pdf-parse

const fs = require("fs")
const path = require("path")

// 检查是否已安装pdf-parse
try {
  require("pdf-parse")
  console.log("✅ pdf-parse 已安装")
} catch (error) {
  console.log("❌ 需要安装 pdf-parse")
  console.log("请运行: npm install pdf-parse")
}

// 创建PDF处理工具函数
const pdfProcessorCode = `
import pdf from 'pdf-parse';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF解析失败:', error);
    throw new Error('无法解析PDF文件');
  }
}

export async function extractPdfMetadata(buffer: Buffer) {
  try {
    const data = await pdf(buffer);
    return {
      pages: data.numpages,
      info: data.info,
      text: data.text,
    };
  } catch (error) {
    console.error('PDF元数据提取失败:', error);
    throw new Error('无法提取PDF元数据');
  }
}
`

// 写入PDF处理工具文件
const utilsDir = path.join(process.cwd(), "lib")
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true })
}

fs.writeFileSync(path.join(utilsDir, "pdf-processor.ts"), pdfProcessorCode)

console.log("✅ PDF处理工具已创建: lib/pdf-processor.ts")
