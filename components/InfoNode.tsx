import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";

export default function InfoNode({ id, data }: NodeProps) {
  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 py-4">
        <h2 className="text-lg font-bold mb-4 text-white px-4 border-b border-gray-700 pb-4">
          Documentation
        </h2>
        <div className="px-4 w-96">
          <p>Welcome to Neuronode. Experiment with Ollama LLMs, spacially!</p>
          <p>
            To make sure that NeuroNode can connect to Ollama, ensure you have
            Ollama installed and running on your local machine. Once installed,
            you need to allow NeuroNode to access your local Ollama instance.
            For instructions on how to do this, please refer to{" "}
            <a
              href="https://medium.com/dcoderai/how-to-handle-cors-settings-in-ollama-a-comprehensive-guide-ee2a5a1beef0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              this guide
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
