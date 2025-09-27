"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAliChatModel = createAliChatModel;
const openai_1 = require("@langchain/openai");
function createAliChatModel(config) {
    return new openai_1.ChatOpenAI({
        apiKey: config.APIKEY, // 你的阿里云API Key
        configuration: {
            baseURL: config.BASEURL, // Ali OpenAI 兼容API
        },
        modelName: config.MODEL, // 选择模型，如 qwen-turbo, qwen-plus, qwen-max
        temperature: 0.5,
        streaming: false
    });
}
