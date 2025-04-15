export interface Token {
  name: string;
  amount: number;
  usdt_amount: number;
}

export interface Node {
  id: string;
  type: "user" | "cex" | "bridge";
  name: string;
  usdt_balance: number;
  tokens: Token[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  id: string;
  sender: string;
  receiver: string;
  usdt_amount: number;
  tokens_amount: Token[];
}

export interface GraphResponse {
  nodes: Node[];
  links: Link[];
}
