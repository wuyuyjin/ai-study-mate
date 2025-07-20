// 安装认证相关依赖
const dependencies = ["bcryptjs", "jsonwebtoken", "@types/bcryptjs", "@types/jsonwebtoken"]

console.log("需要安装的依赖包:")
dependencies.forEach((dep) => {
  console.log(`- ${dep}`)
})

console.log("\n请运行以下命令安装依赖:")
console.log(`npm install ${dependencies.join(" ")}`)

// 检查环境变量
console.log("\n请确保设置了以下环境变量:")
console.log("JWT_SECRET=your-super-secret-jwt-key-here")
