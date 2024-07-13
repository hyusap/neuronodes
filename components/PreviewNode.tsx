import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  NodeProps,
} from "@xyflow/react";
import { Hand } from "lucide-react";

export default function PreviewNode({ data }: NodeProps) {
  const connections = useHandleConnections({
    type: "target",
  });
  const nodeData = useNodesData(connections?.[0].source);

  return (
    <>
      <Handle position={Position.Top} type="target" id="input" />
      <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 py-4">
        <h2 className="text-lg font-bold mb-4 text-white px-4 border-b border-gray-700 pb-4">
          Preview
        </h2>
        <div className="px-4">
          <p>{JSON.stringify(nodeData?.data)}</p>
        </div>
      </div>
    </>
  );
}

// interface DataHandleProps {
//   label: string;
//   onChange: (value: string) => void;
// }

// function DataHandle({ onChange }: DataHandleProps) {
//   return (
//     <div className="flex items-center justify-between">
//       <Handle type="target" position={Position.Top} id="input" />
//     </div>
//   );
// }
