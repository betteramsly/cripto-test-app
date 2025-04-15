import {
  GraphAction,
  LOAD_GRAPH_FAILURE,
  LOAD_GRAPH_REQUEST,
  LOAD_GRAPH_SUCCESS,
} from "./graphActions";
import { Link, Node } from "./types";

interface GraphState {
  nodes: Node[];
  links: Link[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: GraphState = {
  nodes: [],
  links: [],
  status: "idle",
  error: null,
};

export const graphReducer = (
  state = initialState,
  action: GraphAction
): GraphState => {
  switch (action.type) {
    case LOAD_GRAPH_REQUEST:
      return { ...state, status: "loading", error: null };
    case LOAD_GRAPH_SUCCESS: {
      const newNodeIds = new Set(state.nodes.map((none) => none.id));
      const newLinkIds = new Set(state.links.map((link) => link.id));
      return {
        ...state,
        nodes: [
          ...state.nodes,
          ...action.payload.nodes.filter(
            (node: Node) => !newNodeIds.has(node.id)
          ),
        ],
        links: [
          ...state.links,
          ...action.payload.links.filter(
            (link: Link) => !newLinkIds.has(link.id)
          ),
        ],
        status: "succeeded",
      };
    }
    case LOAD_GRAPH_FAILURE:
      return { ...state, status: "failed", error: action.error };
    default:
      return state;
  }
};
