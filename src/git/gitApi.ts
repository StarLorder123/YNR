import axios from "axios";

export interface Commit {
  sha: string;
  author?: string;
  date?: string;
  message?: string;
  url: string;
  files?: { filename: string; patch: string }[]; // 文件 diff
}

export class GitHubClientAxios {
  private token: string;
  private apiBase = "https://api.github.com";

  constructor(token: string) {
    this.token = token;
  }

  private get headers() {
    return {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github.v3+json",
    };
  }

  async getCommits(owner: string, repo: string, branch = "main", per_page = 1): Promise<Commit[]> {
    const url = `${this.apiBase}/repos/${owner}/${repo}/commits`;
    const res = await axios.get(url, {
      headers: this.headers,
      params: { sha: branch, per_page },
    });

    return res.data.map((commit: any) => ({
      sha: commit.sha,
      author: commit.commit.author?.name,
      date: commit.commit.author?.date,
      message: commit.commit.message,
      url: commit.html_url,
    }));
  }

  async getCommitFiles(owner: string, repo: string, sha: string) {
    const url = `${this.apiBase}/repos/${owner}/${repo}/commits/${sha}`;
    const res = await axios.get(url, { headers: this.headers });
    return res.data.files.map((f: any) => ({ filename: f.filename, patch: f.patch }));
  }

  async commentCommit(owner: string, repo: string, commitSha: string, body: string) {
    const url = `${this.apiBase}/repos/${owner}/${repo}/commits/${commitSha}/comments`;
    const res = await axios.post(url, { body }, { headers: this.headers });
    return res.data;
  }
}
