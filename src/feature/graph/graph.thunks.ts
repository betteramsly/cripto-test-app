import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import { graphApi } from "./graph.api";
import { GraphState } from "./graphSlice";
import { GraphResponse } from "./types";

export const graphThunks = {
  fetchGraphData: createAsyncThunk(
    "graph/loadGraph",
    async (address: string) => {
      const { data } = await graphApi.fetchGraphByAddress(address);
      return data;
    }
  ),
};

const { fetchGraphData } = graphThunks;

export const connectGraphThunks = ({
  addCase,
}: ActionReducerMapBuilder<GraphState>) => {
  addCase(fetchGraphData.pending, (state) => {
    state.status = "loading";
    state.error = null;
  });
  addCase(
    fetchGraphData.fulfilled,
    (state, action: PayloadAction<GraphResponse>) => {
      const newNodes = action.payload.nodes.filter(
        (node) => !state.nodes.map((n) => n.id).includes(node.id)
      );

      const newLinks = action.payload.links.filter(
        (link) => !state.links.map((l) => l.id).includes(link.id)
      );

      state.nodes.push(...newNodes);
      state.links.push(...newLinks);
      state.status = "succeeded";
    }
  );
  addCase(fetchGraphData.rejected, (state, action) => {
    state.status = "failed";
    state.error = action.error.message || "Unknown error";
  });
};
