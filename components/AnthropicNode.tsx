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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OllamaNode({ id, data }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const [modelName, setModelName] = useState("");

  const [apiKey, setApiKey] = useState("");
  const [debouncedApiKey] = useDebounce(apiKey, 1000);

  useEffect(() => {
    console.log("update", modelName, debouncedApiKey);
    updateNodeData(id, {
      llmInfo: {
        model: modelName,
        apiKey: debouncedApiKey,
        provider: "anthropic",
      },
    });
  }, [modelName, debouncedApiKey, id, updateNodeData]);

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 py-4">
        <h2 className="text-lg font-bold mb-4 text-white px-4 border-b border-gray-700 pb-4">
          Anthropic Provider
        </h2>
        <div className="px-4">
          <FormItem>
            <Label>Model Name</Label>

            <Select onValueChange={setModelName} value={modelName}>
              <SelectTrigger className="w-96">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-3-opus-20240229">
                  Claude 3 Opus
                </SelectItem>
                <SelectItem value="claude-3-sonnet-20240229">
                  Claude 3 Sonnet
                </SelectItem>
                <SelectItem value="claude-3-haiku-20240307">
                  Claude 3 Haiku
                </SelectItem>
                <SelectItem value="claude-3-5-sonnet-20240620">
                  Claude 3.5 Sonnet
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>

          <FormItem className="mt-4">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="Enter your Anthropic API key"
              className="w-96"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </FormItem>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  );
}
