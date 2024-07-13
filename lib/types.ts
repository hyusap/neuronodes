import { type CoreMessage } from "ai";

// export interface MessageData {
//   role: "user" | "assistant";
//   content: string;
// }

export interface NodeData {
  messages: CoreMessage[];
  llmInfo: LLMInfo;
}

// export interface LLMInfo {
//   model: string;

// }
export interface AnthropicInfo {
  model: string;
  apiKey: string;
  provider: "anthropic";
}

export interface OllamaInfo {
  model: string;
  provider: "ollama";
}

export type LLMInfo = AnthropicInfo | OllamaInfo;
