import {
  LOAD_GRAPH_FAILURE,
  LOAD_GRAPH_REQUEST,
  LOAD_GRAPH_SUCCESS,
} from "./graph.constans";

export interface Token {
  name: string;
  amount: number;
  usdt_amount: number;
}

export interface Node {
  id: string;
  type: "user" | "cex" | "bridge" | "group";
  name: string;
  usdt_balance: number;
  tokens: Token[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  id?: string;
  sender: string;
  receiver: string;
  usdt_amount: number;
  tokens_amount: Token[];
}

export interface GraphResponse {
  nodes: Node[];
  links: Link[];
}

export type GraphAction =
  | { type: typeof LOAD_GRAPH_REQUEST }
  | { type: typeof LOAD_GRAPH_SUCCESS; payload: GraphResponse }
  | { type: typeof LOAD_GRAPH_FAILURE; error: string };
