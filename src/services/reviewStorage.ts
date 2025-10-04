import fs from "fs";
import path from "path";

export interface ReviewRecord {
    commit: string;
    author?: string;
    message?: string;
    createdAt: string;
    content: string;
}

export interface ReviewStorageOptions {
    rootDir?: string; // 存储根目录，默认 "reviews"
}

export class MarkdownReviewStorage {
    private rootDir: string;

    constructor(options: ReviewStorageOptions = {}) {
        this.rootDir = options.rootDir ?? path.resolve(process.cwd(), "reviews");
    }

    async save(record: ReviewRecord): Promise<string> {
        const dir = this.rootDir;
        await fs.promises.mkdir(dir, { recursive: true });

        const filename = `${sanitize(record.commit)}.md`;
        const filePath = path.join(dir, filename);

        const md = this.formatMarkdown(record);
        await fs.promises.writeFile(filePath, md, "utf-8");
        return filePath;
    }

    formatMarkdown(record: ReviewRecord): string {
        const lines: string[] = [];
        lines.push(`# Commit ${record.commit}`);
        if (record.author) lines.push(`- Author: ${record.author}`);
        if (record.message) lines.push(`- Message: ${record.message}`);
        lines.push(`- CreatedAt: ${record.createdAt}`);
        lines.push("");
        lines.push("## Review");
        lines.push("");
        lines.push(record.content);
        lines.push("");
        return lines.join("\n");
    }
}

function sanitize(input: string): string {
    return input.replace(/[^a-zA-Z0-9._-]/g, "_");
}


