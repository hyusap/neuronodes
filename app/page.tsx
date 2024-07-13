"use client";

import ChatNode from "@/components/ChatNode";
import InfoNode from "@/components/InfoNode";
import LLMNode from "@/components/LLMNode";
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
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useRef } from "react";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const initialNodes = [
  {
    id: "1",
    type: "llmNode",
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

function Home() {
  const nodeTypes = useMemo(
    () => ({ llmNode: LLMNode, chatNode: ChatNode, infoNode: InfoNode }),
    []
  );

  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
      if (startNode?.type !== "chatNode") {
        console.log("Connection must start from a chat node");
        return;
      }

      const endNodeType = startNode.data.type === "user" ? "assistant" : "user";

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
          eds.concat({ id, source: connectingNodeId.current!, target: id })
        );
      }
    },
    [screenToFlowPosition, nodes]
  );

  return (
    <main className="h-screen w-screen">
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
