import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { useDebounce } from "use-debounce";
import { Label } from "./ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const LLMNodeSchema = z.object({
//   apiKey: z.string().startsWith("sk-ant-"),
//   model: z.string(),
//   systemPrompt: z.string(),
// });

export default function OllamaNode({ id, data }: NodeProps) {
  // const form = useForm<z.infer<typeof LLMNodeSchema>>({
  //   resolver: zodResolver(LLMNodeSchema),
  // });

  const { updateNodeData } = useReactFlow();
  const [modelName, setModelName] = useState("");
  const [debouncedModelName] = useDebounce(modelName, 1000);

  useEffect(() => {
    updateNodeData(id, {
      llmInfo: { model: debouncedModelName, provider: "ollama" },
    });
  }, [debouncedModelName]);

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 py-4">
        <h2 className="text-lg font-bold mb-4 text-white px-4 border-b border-gray-700 pb-4">
          Ollama Provider
        </h2>
        <div className="px-4">
          <FormItem>
            <Label>Model Name</Label>

            <Input
              placeholder="llama3"
              className="w-96"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              // {...field}
            />
          </FormItem>
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
