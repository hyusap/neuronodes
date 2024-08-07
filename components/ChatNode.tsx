import {
  Handle,
  Node,
  NodeProps,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";
import { LLMInfo, NodeData } from "@/lib/types";
// import { continueConversation } from "@/app/actions";
import { runAI } from "@/lib/ai";
import { readStreamableValue } from "ai/rsc";
import { get } from "http";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";

export type CounterNode = Node<
  {
    type: "user" | "assistant";
    messages: string[];
  },
  "chatNode"
>;

export default function ChatNode({ id, data, selected }: NodeProps) {
  const { type } = data;
  const { updateNodeData } = useReactFlow();
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebounce(value, 1000);
  const currentMessage = { role: type, content: value };

  const connections = useHandleConnections({
    type: "target",
  });
  const nodeData = useNodesData(connections?.[0].source)?.data as
    | NodeData
    | undefined;

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [nodeData]
  );

  useEffect(() => {
    const pastMessages = nodeData?.messages || [];
    const llmInfo = nodeData?.llmInfo || ({} as LLMInfo);
    updateNodeData(id, { messages: [...pastMessages, currentMessage] });

    if (type !== "assistant") {
      return;
    }

    if (pastMessages.some((message) => message.content === "")) {
      console.log("empty message");
      return;
    }

    async function getResponse() {
      console.trace(pastMessages);
      const response = runAI(llmInfo, pastMessages);
      if (response) {
        setValue("");
        for await (const content of response) {
          setValue(content as string);
        }
      }
    }

    getResponse();
  }, [nodeData]);

  useEffect(() => {
    const pastMessages = nodeData?.messages || [];
    const newMessage = { role: type, content: debouncedValue };
    const llmInfo = nodeData?.llmInfo || {};
    updateNodeData(id, { messages: [...pastMessages, newMessage], llmInfo });
  }, [nodeData, debouncedValue]);

  return (
    <>
      <Handle position={Position.Top} type="target" id="input" />
      <div
        className={cn(
          "bg-gray-800 rounded-lg shadow-md border border-gray-700 py-4 transition-all duration-300 outline-gray-700",
          selected && "outline outline-2 "
        )}
      >
        <h2 className="text-lg font-bold mb-4 text-white px-4 border-b border-gray-700 pb-4">
          {type === "user" ? "User" : "Assistant"}
        </h2>
        <div className="px-4">
          {type === "user" ? (
            <Textarea
              placeholder="Type your message here..."
              className="w-96"
              value={value}
              onChange={onChange}
            />
          ) : (
            <div className="text-white w-96">{value}</div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!size-7 flex text-black justify-center items-center"
      >
        +
      </Handle>
    </>
  );
}
