import { readStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { ollama } from "ollama-ai-provider";

import { toast } from "sonner";
import { LLMInfo, OllamaInfo } from "./types";
import { runAnthropic } from "./server-ai";

export async function* runAI(llmInfo: LLMInfo, messages: CoreMessage[]) {
  // console.log("RUNNING");
  // try {
  //   if (!llmInfo.model) {
  //     throw new Error("Please select a model name");
  //   }
  //   let model;
  //   switch (llmInfo.provider) {
  //     case "anthropic":
  //       if (!llmInfo.apiKey) {
  //         throw new Error("Please provide an API key");
  //       }
  //       const anthropic = createAnthropic({
  //         apiKey: llmInfo.apiKey,
  //       });
  //       model = anthropic(llmInfo.model);
  //       break;
  //     case "ollama":
  //       model = ollama(llmInfo.model);
  //       break;
  //     default:
  //       throw new Error("Unsupported provider");
  //   }

  //   const result = await streamText({
  //     model,
  //     messages,
  //   });

  //   return result.textStream;
  // } catch (error) {
  //   if (error instanceof Error) {
  //     toast.error(error.message);
  //   } else {
  //     toast.error("An unknown error occurred");
  //   }
  // }
  if (!llmInfo.model) {
    toast.error("Please select a model name");
    return;
  }

  switch (llmInfo.provider) {
    case "anthropic":
      if (!llmInfo.apiKey) {
        toast.error("Please provide an API key");
        return;
      }
      const result = await runAnthropic(llmInfo, messages);

      for await (const content of readStreamableValue(result)) {
        yield content;
      }

      break;

    case "ollama":
      const stream = await runOllama(llmInfo, messages);
      let sum = "";
      for await (const content of stream) {
        sum += content;
        yield sum;
      }
      break;
  }
}

async function runOllama(llmInfo: OllamaInfo, messages: CoreMessage[]) {
  const model = ollama(llmInfo.model);
  const result = await streamText({
    model,
    messages,
  });
  return result.textStream;
}
