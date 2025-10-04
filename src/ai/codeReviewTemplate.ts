import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export type CommitReviewInput = {
  commit: string;
  author?: string;
  message?: string;
  diff: string;
};

export function createCodeReviewMessages(input: CommitReviewInput) {
  const { commit, author, message, diff } = input;

  const systemMessage = new SystemMessage(
    `你是一名高级代码审查助手，负责总结、分析和评估 Git commit。
你的任务：

- 提交摘要：简要说明这个 commit 做了什么。
- 主要改动点：逐条列出重要修改。
- 意图与原因：结合 commit message 推测为什么要改。
- 潜在影响：分析兼容性、性能、安全性等问题。
- 改进建议：如果有更好的做法，请提出。

要求：

- 输出 Markdown 格式。
- 使用清晰的标题和列表。
- 不要重复原始 diff，只做总结与分析。
- 如果 diff 很长，聚焦主要逻辑变化。
- 全程使用中文，避免冗长；在提及文件、函数、类、变量名时使用反引号。
`
  );

  const userMessage = new HumanMessage(
    `Commit: ${commit}
Author: ${author ?? ""}
Message: ${message ?? ""}

Diff:
\`\`\`diff
${diff}
\`\`\``
  );

  return [systemMessage, userMessage];
}
