"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIReviewService = void 0;
const gitApi_1 = require("../git/gitApi");
const codeReviewTemplate_1 = require("../ai/codeReviewTemplate");
const llm_1 = require("../core/base/llm");
class AIReviewService {
    github;
    ai;
    constructor(githubToken) {
        this.github = new gitApi_1.GitHubClientAxios(githubToken);
        this.ai = (0, llm_1.createAliChatModel)({
            BASEURL: process.env.BASEURL ?? '',
            MODEL: process.env.MODEL ?? '',
            APIKEY: process.env.APIKEY ?? ''
        });
    }
    async reviewLatestCommit(owner, repo, branch = "main") {
        // 获取最新 commit
        const commits = await this.github.getCommits(owner, repo, branch, 1);
        const latestCommit = commits[0];
        // 获取 commit 文件 diff
        const files = await this.github.getCommitFiles(owner, repo, latestCommit.sha);
        const code = files.map((f) => `// File: ${f.filename}\n${f.patch}`).join("\n\n");
        // 生成 AI 消息
        const messages = (0, codeReviewTemplate_1.createCodeReviewMessages)(code, "");
        // 调用 AI
        const review = (await this.ai.invoke(messages)).text;
        // 提交评论
        const commentResult = await this.github.commentCommit(owner, repo, latestCommit.sha, review);
        return { latestCommit, review, commentResult };
    }
}
exports.AIReviewService = AIReviewService;
