import { createAliChatModel } from "./core/base/llm";
import dotenv from 'dotenv';
import { GitHubClientAxios } from "./git/gitApi";
import { AIReviewService } from "./services/aiCodeReviewService";
import { WebhookServer } from "./services/webhookServer";
dotenv.config();

// async function main() {
//   const llm = createAliChatModel({
//     BASEURL: process.env.BASEURL ?? '',
//     MODEL: process.env.MODEL ?? '',
//     APIKEY: process.env.APIKEY ?? ''
//   });

//   // 简单调用
//   const res = await llm.invoke("请用 TypeScript 写一个快速排序的例子");
//   console.log("AI 回复:", res.content);

//   // 也可以作为 LangChain chain 使用
//   const structured = await llm.invoke("给我 3 个 Vue 的面试问题");
//   console.log("结构化输出:", structured);
// }

// main().catch(console.error);

async function main() {
  const token = process.env.GITHUB_TOKEN || "";
  const service = new AIReviewService(token);

  // 启动 Webhook 服务（默认端口 8787，路径 /webhook）
  const server = new WebhookServer(service, {
    port: Number(process.env.WEBHOOK_PORT || 8787),
    path: process.env.WEBHOOK_PATH || "/webhook",
    githubSecret: process.env.WEBHOOK_SECRET || undefined
  });
  server.start();
}

main().catch(console.error);

