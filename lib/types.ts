import { type CoreMessage } from "ai";

// export interface MessageData {
//   role: "user" | "assistant";
//   content: string;
// }

export interface NodeData {
  messages: CoreMessage[];
  llmInfo: LLMInfo;
}

export interface LLMInfo {
  model: string;
}
