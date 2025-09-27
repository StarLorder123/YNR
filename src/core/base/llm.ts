import { ChatOpenAI } from "@langchain/openai";
import { LLMConfig } from "./types";

export function createAliChatModel(config: LLMConfig) {
    return new ChatOpenAI({
        apiKey: config.APIKEY, // 你的阿里云API Key
        configuration: {
            baseURL: config.BASEURL, // Ali OpenAI 兼容API
        },
        modelName: config.MODEL, // 选择模型，如 qwen-turbo, qwen-plus, qwen-max
        temperature: 0.5,
        streaming: false
    });
}