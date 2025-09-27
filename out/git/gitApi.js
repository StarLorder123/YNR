"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClientAxios = void 0;
const axios_1 = __importDefault(require("axios"));
class GitHubClientAxios {
    token;
    apiBase = "https://api.github.com";
    constructor(token) {
        this.token = token;
    }
    get headers() {
        return {
            Authorization: `token ${this.token}`,
            Accept: "application/vnd.github.v3+json",
        };
    }
    async getCommits(owner, repo, branch = "main", per_page = 1) {
        const url = `${this.apiBase}/repos/${owner}/${repo}/commits`;
        const res = await axios_1.default.get(url, {
            headers: this.headers,
            params: { sha: branch, per_page },
        });
        return res.data.map((commit) => ({
            sha: commit.sha,
            author: commit.commit.author?.name,
            date: commit.commit.author?.date,
            message: commit.commit.message,
            url: commit.html_url,
        }));
    }
    async getCommitFiles(owner, repo, sha) {
        const url = `${this.apiBase}/repos/${owner}/${repo}/commits/${sha}`;
        const res = await axios_1.default.get(url, { headers: this.headers });
        return res.data.files.map((f) => ({ filename: f.filename, patch: f.patch }));
    }
    async commentCommit(owner, repo, commitSha, body) {
        const url = `${this.apiBase}/repos/${owner}/${repo}/commits/${commitSha}/comments`;
        const res = await axios_1.default.post(url, { body }, { headers: this.headers });
        return res.data;
    }
}
exports.GitHubClientAxios = GitHubClientAxios;
