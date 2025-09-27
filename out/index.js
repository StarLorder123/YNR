"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const aiCodeReviewService_1 = require("./services/aiCodeReviewService");
dotenv_1.default.config();
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
    const owner = "StarLorder123";
    const repo = "amap_flutter";
    const service = new aiCodeReviewService_1.AIReviewService(token);
    const result = await service.reviewLatestCommit(owner, repo, "main");
    console.log("最新 commit:", result.latestCommit.sha);
    console.log("AI Review 内容:\n", result.review);
    console.log("评论提交链接:", result.commentResult.html_url);
}
main().catch(console.error);
