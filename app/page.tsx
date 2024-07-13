"use client";

import AnthropicNode from "@/components/AnthropicNode";
import ChatNode from "@/components/ChatNode";
import InfoNode from "@/components/InfoNode";
import OllamaNode from "@/components/OllamaNode";
import PreviewNode from "@/components/PreviewNode";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  OnConnect,
  OnConnectStart,
  OnConnectEnd,
  ReactFlowInstance,
} from "@xyflow/react";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const initialNodes = [
  {
    id: "1",
    type: "anthropicNode",
    position: { x: 0, y: 0 },
    data: { messages: [] },
  },
  {
    id: "2",
    type: "chatNode",
    position: { x: 0, y: 300 },
    data: { type: "user" },
  },
  {
    id: "3",
    type: "chatNode",
    position: { x: 0, y: 600 },
    data: { type: "assistant" },
  },
  {
    id: "4",
    type: "infoNode",
    position: { x: 500, y: 250 },
    data: {},
  },
];
const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
];

let id = 6;
const getId = () => `${id++}`;

declare global {
  interface Window {
    showSaveFilePicker: (options?: any) => Promise<FileSystemFileHandle>;
    showOpenFilePicker: (options?: any) => Promise<FileSystemFileHandle[]>;
  }
}

function Home() {
  const nodeTypes = useMemo(
    () => ({
      ollamaNode: OllamaNode,
      chatNode: ChatNode,
      infoNode: InfoNode,
      anthropicNode: AnthropicNode,
    }),
    []
  );

  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const connectingNodeId = useRef<string | null>(null);

  const onConnect: OnConnect = useCallback((params) => {
    // reset the start node on connections
    connectingNodeId.current = null;
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const startNode = nodes.find(
        (node) => node.id === connectingNodeId.current
      );

      console.log(startNode);
      // if (startNode?.type !== "chatNode" && startNode?.type !== "ollamaNode") {
      //   console.log("Connection must start from a chat node");
      //   return;
      // }

      const endNodeType =
        startNode?.type === "chatNode"
          ? startNode.data.type === "user"
            ? "assistant"
            : "user"
          : "user";

      const targetIsPane =
        event.target instanceof Element &&
        event.target.classList.contains("react-flow__pane");

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const newNode = {
          id,
          type: "chatNode",
          position: screenToFlowPosition({
            x:
              event instanceof MouseEvent
                ? event.clientX
                : event.touches[0].clientX,
            y:
              event instanceof MouseEvent
                ? event.clientY
                : event.touches[0].clientY,
          }),
          data: { type: endNodeType },
          // origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({
            id,
            source: connectingNodeId.current!,
            target: id,
            animated: true,
          })
        );
      }
    },
    [screenToFlowPosition, nodes]
  );

  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
    null
  );

  async function saveAsFile() {
    const flow = rfInstance!.toObject();
    const jsonString = JSON.stringify(flow, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    try {
      // Request permission to access the file system
      const newFileHandle = await window.showSaveFilePicker({
        suggestedName: "flow.nn",
        types: [
          {
            description: "Neuronode Flow",
            accept: { "application/json": [".nn"] },
          },
        ],
      });
      setFileHandle(newFileHandle);

      // Create a writable stream and write the blob to it
      const writable = await newFileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      console.log("File saved successfully");
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }

  useEffect(() => {
    async function saveToOpenedFile() {
      if (!fileHandle) {
        console.error("No file handle available");
        return;
      }
      const flow = rfInstance!.toObject();
      const jsonString = JSON.stringify(flow, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });

      try {
        // Create a writable stream and write the blob to it
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        console.log("File saved successfully");
      } catch (error) {
        console.error("Error saving to opened file:", error);
      }
    }

    if (fileHandle) {
      saveToOpenedFile();
    }
  }, [nodes, edges]);

  async function loadFromFile() {
    try {
      // Open file picker
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Neuronode Flow",
            accept: { "application/json": [".nn"] },
          },
        ],
      });

      // Get the file contents
      const file = await fileHandle.getFile();
      const contents = await file.text();

      // Parse the JSON
      const flow = JSON.parse(contents);

      // Set the file handle
      setFileHandle(fileHandle);

      // Update the React Flow instance with the loaded data
      if (rfInstance) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        rfInstance.setNodes(flow.nodes || []);
        rfInstance.setEdges(flow.edges || []);
        rfInstance.setViewport({ x, y, zoom });
      }

      console.log("File loaded successfully");
    } catch (error) {
      console.error("Error loading file:", error);
    }
  }

  const addNewOllamaProvider = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const newNode = {
      id: getId(),
      type: "ollamaNode",
      position,
      data: { messages: [] },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes]);

  const addNewAnthropicProvider = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const newNode = {
      id: getId(),
      type: "anthropicNode",
      position,
      data: { messages: [] },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes]);

  return (
    <main className="h-screen w-screen">
      <div className="absolute top-4 left-4 z-10">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={loadFromFile}>Open</MenubarItem>
              {fileHandle ? (
                <MenubarItem disabled>
                  Autosaving to {fileHandle.name}
                </MenubarItem>
              ) : (
                <MenubarItem onClick={saveAsFile}>Save to</MenubarItem>
              )}
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={addNewOllamaProvider}>
                New Ollama Provider
              </MenubarItem>
              <MenubarItem onClick={addNewAnthropicProvider}>
                New Anthropic Provider
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        colorMode="dark"
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        proOptions={{ hideAttribution: true }}
        fitView={true}
        onInit={(instance) => {
          setRfInstance(instance as ReactFlowInstance);
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </main>
  );
}

const HomeWithProvider = () => (
  <ReactFlowProvider>
    <Home />
  </ReactFlowProvider>
);

export default HomeWithProvider;
