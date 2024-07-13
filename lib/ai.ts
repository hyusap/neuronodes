import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
// import { openai } from '@ai-sdk/openai';
// import { anthropic } from "@ai-sdk/anthropic";
import { ollama } from "ollama-ai-provider";
// import { TextDecoderStream } from "@/polyfills/textencoderstream";
import "@stardazed/streams-polyfill";
import { toast } from "sonner";

export async function continueConversation(
  model: string,
  messages: CoreMessage[]
) {
  console.log("RUNNING");
  try {
    if (model === "") {
      throw new Error("Please select a model name");
    }
    const result = await streamText({
      // model: anthropic("claude-3-haiku-20240307"),
      model: ollama(model),
      messages,
    });

    // const stream = createStreamableValue(result.textStream);
    // return stream.value;
    return result.textStream;
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unknown error occurred");
    }
  }
}
