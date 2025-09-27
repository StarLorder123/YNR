import axios from "axios";

export interface Commit {
  sha: string;
  author?: string;
  date?: string;
  message?: string;
  url: string;
}

export class GiteaClient {
  private token: string;
  private apiBase: string;

  constructor(token: string, apiBase: string) {
    this.token = token;
    this.apiBase = apiBase; // 例如 https://gitea.example.com/api/v1
  }

  private get headers() {
    return {
      Authorization: `token ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  // 获取 commit 列表
  async getCommits(owner: string, repo: string, branch = "master", limit = 10): Promise<Commit[]> {
    const url = `${this.apiBase}/repos/${owner}/${repo}/commits`;
    const res = await axios.get(url, {
      headers: this.headers,
      params: { sha: branch, limit },
    });
    return res.data.map((commit: any) => ({
      sha: commit.sha,
      author: commit.author?.name || commit.committer?.name,
      date: commit.committer?.date,
      message: commit.message,
      url: `${this.apiBase}/repos/${owner}/${repo}/commit/${commit.sha}`,
    }));
  }

  // 对 commit 提交评论
  async commentCommit(owner: string, repo: string, commitSha: string, body: string) {
    const url = `${this.apiBase}/repos/${owner}/${repo}/commits/${commitSha}/comments`;
    const res = await axios.post(
      url,
      { body },
      { headers: this.headers }
    );
    return res.data;
  }
}
