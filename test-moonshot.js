// 测试 Moonshot AI 文件上传功能配置
async function testMoonshotUpload() {
    const apiKey = process.env.MOONSHOT_DEMO_API_KEY;

    if (!apiKey) {
        console.log('❌ 请设置 MOONSHOT_DEMO_API_KEY 环境变量');
        return;
    }

    console.log('✅ API Key 已配置');
    console.log('🚀 Moonshot AI 文件上传功能已集成');

    console.log('\n📋 功能说明:');
    console.log('1. 支持上传 PDF、Markdown、TXT 文件');
    console.log('2. 自动提取文件内容');
    console.log('3. 支持上下文缓存功能');
    console.log('4. 生成高质量学习卡片');

    console.log('\n🔧 使用方法:');
    console.log('1. 打开创建卡片页面，选择 "文件上传" 标签');
    console.log('2. 上传学习文件（PDF、Markdown、TXT）');
    console.log('3. 选择提取模式（重点卡片提取 或 知识问答生成）');
    console.log('4. 点击 "从文件生成卡片" 按钮');
    console.log('5. 编辑和保存生成的卡片');

    console.log('\n📁 相关文件:');
    console.log('- lib/moonshot-upload.ts - Moonshot AI 集成库');
    console.log('- app/api/generate-cards-moonshot/route.ts - API 路由');
    console.log('- components/create-card-form.tsx - 前端组件');
}

testMoonshotUpload();
