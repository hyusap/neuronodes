"use server";

// import "@stardazed/streams-polyfill";
import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { AnthropicInfo } from "./types";
import { PolyfillTextDecoderStream } from "@/polyfills/textencoderstream";

export async function runAnthropic(
  llmInfo: AnthropicInfo,
  messages: CoreMessage[]
) {
  globalThis.TextDecoderStream = PolyfillTextDecoderStream;

  const anthropic = createAnthropic({
    apiKey: llmInfo.apiKey,
  });
  const model = anthropic(llmInfo.model);
  const result = await streamText({
    model,
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
