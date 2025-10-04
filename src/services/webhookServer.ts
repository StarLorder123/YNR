import http from "http";
import crypto from "crypto";
import { AIReviewService } from "./aiCodeReviewService";
import { Logger } from "../core/logger/logger";
import { TaskQueue } from "./taskQueue";

export interface WebhookServerOptions {
    port?: number;
    path?: string;
    githubSecret?: string; // 可选：用于校验 GitHub/Gitea webhook 签名
}

export class WebhookServer {
    private server?: http.Server;
    private readonly port: number;
    private readonly path: string;
    private readonly githubSecret?: string;
    private readonly reviewService: AIReviewService;
    private readonly logger = new Logger("webhook.log");
    private readonly queue = new TaskQueue();

    constructor(reviewService: AIReviewService, options: WebhookServerOptions = {}) {
        this.reviewService = reviewService;
        this.port = options.port ?? 8787;
        this.path = options.path ?? "/webhook";
        this.githubSecret = options.githubSecret;
    }

    start() {
        this.server = http.createServer(async (req, res) => {
            if (!req.url || !req.method) {
                res.statusCode = 400;
                res.end("Bad Request");
                return;
            }

            if (req.url.startsWith(this.path) && req.method === "POST") {
                try {
                    const raw = await readBody(req);
                    if (this.githubSecret) {
                        if (!verifySignature(req, raw, this.githubSecret)) {
                            this.logger.warn("签名校验失败");
                            res.statusCode = 401;
                            res.end("Invalid signature");
                            return;
                        }
                    }

                    const payload = JSON.parse(raw.toString("utf-8"));

                    // 兼容 GitHub/Gitea：从 payload 中提取 owner/repo/sha
                    const { owner, repo, sha } = extractCommitRef(payload);
                    if (!owner || !repo || !sha) {
                        this.logger.warn("缺少必要字段 owner/repo/sha");
                        res.statusCode = 400;
                        res.end("Missing owner/repo/sha");
                        return;
                    }

                    this.logger.info(`收到 webhook: ${owner}/${repo}@${sha}`);

                    // 入队串行处理
                    this.queue.enqueue(async () => {
                        try {
                            const { review } = await this.reviewService.reviewCommit(owner, repo, sha);
                            this.logger.info(`完成审查并已记录+邮件发送: ${owner}/${repo}@${sha}; 内容长度=${review.length}`);
                        } catch (err: any) {
                            this.logger.error(`审查失败: ${owner}/${repo}@${sha} -> ${err?.message ?? String(err)}`);
                        }
                    });

                    res.statusCode = 202;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ ok: true, queued: true, sha }));
                } catch (err: any) {
                    this.logger.error(`处理 webhook 失败: ${err?.message ?? String(err)}`);
                    res.statusCode = 500;
                    res.end("Internal Server Error");
                }
                return;
            }

            res.statusCode = 404;
            res.end("Not Found");
        });

        this.server.listen(this.port, () => {
            this.logger.info(`Webhook server listening on http://localhost:${this.port}${this.path}`);
        });
    }

    close() {
        this.server?.close();
    }
}

function readBody(req: http.IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

function verifySignature(req: http.IncomingMessage, body: Buffer, secret: string): boolean {
    // 兼容 GitHub/Gitea 的 X-Hub-Signature-256
    const signature = req.headers["x-hub-signature-256"] as string | undefined;
    if (!signature) return false;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(body);
    const expected = `sha256=${hmac.digest("hex")}`;
    return safeEqual(signature, expected);
}

function safeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
}

function extractCommitRef(payload: any): { owner?: string; repo?: string; sha?: string } {
    // GitHub push event
    const repoFull = payload?.repository?.full_name as string | undefined; // owner/repo
    const owner = repoFull?.split("/")[0];
    const repo = repoFull?.split("/")[1];

    // 取 head_commit 或者 after
    const sha = payload?.head_commit?.id || payload?.after || payload?.checkout_sha || payload?.pull_request?.head?.sha;

    return { owner, repo, sha };
}


