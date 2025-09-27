import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export function createCodeReviewMessages(code: string, language = "TypeScript") {
  const systemMessage = new SystemMessage(
    `你是一个资深 ${language} 开发工程师，同时也是代码审查专家。
请对用户提供的代码进行审查，包括功能正确性、性能、安全性、代码风格，并给出改进建议。`
  );

  const userMessage = new HumanMessage(
    `需要审查的代码如下：
\`\`\`${language}
${code}
\`\`\`
请输出结构化反馈。`
  );

  return [systemMessage, userMessage];
}
