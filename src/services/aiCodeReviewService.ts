import { GitHubClientAxios, Commit } from "../git/gitApi";
import { createCodeReviewMessages } from "../ai/codeReviewTemplate";
import { MarkdownReviewStorage } from "./reviewStorage";
import { createAliChatModel } from "../core/base/llm";
import { SmtpMailer, loadSmtpConfigFromEnv } from "./mailer";

export class AIReviewService {
    private github: GitHubClientAxios;
    private ai;
    private storage: MarkdownReviewStorage;
    private mailer?: SmtpMailer;

    constructor(githubToken: string) {
        this.github = new GitHubClientAxios(githubToken);
        this.ai = createAliChatModel({
            BASEURL: process.env.BASEURL ?? '',
            MODEL: process.env.MODEL ?? '',
            APIKEY: process.env.APIKEY ?? ''
        });
        this.storage = new MarkdownReviewStorage();
        const smtp = loadSmtpConfigFromEnv();
        if (smtp) {
            this.mailer = new SmtpMailer(smtp);
        }
    }

    async reviewLatestCommit(owner: string, repo: string, branch = "main") {
        // 获取最新 commit
        const commits: Commit[] = await this.github.getCommits(owner, repo, branch, 1);
        const latestCommit = commits[0];

        // 获取 commit 文件 diff
        const files = await this.github.getCommitFiles(owner, repo, latestCommit.sha);
        const diff = files.map((f: { filename: string; patch: string; }) => `diff --git a/${f.filename} b/${f.filename}\n${f.patch}`).join("\n\n");

        // 生成 AI 消息
        const messages = createCodeReviewMessages({
            commit: latestCommit.sha,
            author: latestCommit.author,
            message: latestCommit.message,
            diff
        });

        // 调用 AI
        const review = (await this.ai.invoke(messages)).text;

        // 持久化存储
        await this.storage.save({
            commit: latestCommit.sha,
            author: latestCommit.author,
            message: latestCommit.message,
            createdAt: new Date().toISOString(),
            content: review
        });

        // 发送邮件（若配置）
        if (this.mailer) {
            const to = process.env.MAIL_TO ?? "";
            if (to) {
                await this.mailer.send(to, `Code Review: ${owner}/${repo}@${latestCommit.sha}`, toHtml(review));
            }
        }
        return { latestCommit, review };
    }

    async reviewCommit(owner: string, repo: string, sha: string) {
        const files = await this.github.getCommitFiles(owner, repo, sha);
        const diff = files.map((f: { filename: string; patch: string; }) => `diff --git a/${f.filename} b/${f.filename}\n${f.patch}`).join("\n\n");

        const commitInfo: Commit[] = await this.github.getCommits(owner, repo, sha, 1);
        const meta = commitInfo[0] ?? { sha } as Commit;

        const messages = createCodeReviewMessages({
            commit: sha,
            author: meta.author,
            message: meta.message,
            diff
        });
        const review = (await this.ai.invoke(messages)).text;
        await this.storage.save({
            commit: sha,
            author: meta.author,
            message: meta.message,
            createdAt: new Date().toISOString(),
            content: review
        });
        if (this.mailer) {
            const to = process.env.MAIL_TO ?? "";
            if (to) {
                await this.mailer.send(to, `Code Review: ${owner}/${repo}@${sha}`, toHtml(review));
            }
        }
        return { review };
    }
}

function toHtml(text: string): string {
    return `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; white-space: pre-wrap;">${escapeHtml(text)}</pre>`;
}

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
