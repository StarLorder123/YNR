import { GitHubClientAxios, Commit } from "../git/gitApi";
import { createCodeReviewMessages } from "../ai/codeReviewTemplate";
import { createAliChatModel } from "../core/base/llm";

export class AIReviewService {
    private github: GitHubClientAxios;
    private ai;

    constructor(githubToken: string) {
        this.github = new GitHubClientAxios(githubToken);
        this.ai = createAliChatModel({
            BASEURL: process.env.BASEURL ?? '',
            MODEL: process.env.MODEL ?? '',
            APIKEY: process.env.APIKEY ?? ''
        });
    }

    async reviewLatestCommit(owner: string, repo: string, branch = "main") {
        // 获取最新 commit
        const commits: Commit[] = await this.github.getCommits(owner, repo, branch, 1);
        const latestCommit = commits[0];

        // 获取 commit 文件 diff
        const files = await this.github.getCommitFiles(owner, repo, latestCommit.sha);
        const code = files.map((f: { filename: any; patch: any; }) => `// File: ${f.filename}\n${f.patch}`).join("\n\n");

        // 生成 AI 消息
        const messages = createCodeReviewMessages(code, "");

        // 调用 AI
        const review = (await this.ai.invoke(messages)).text;

        // 提交评论
        const commentResult = await this.github.commentCommit(owner, repo, latestCommit.sha, review);

        return { latestCommit, review, commentResult };
    }
}
