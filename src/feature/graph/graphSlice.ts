import { bindActionCreators, createSlice } from "@reduxjs/toolkit";
import { Link, Node } from "./types";
import { connectGraphThunks, graphThunks } from "./graph.thunks";
import { useMemo } from "react";
import { useAppDispatch } from "../../app/store";

export interface GraphState {
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

export const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    connectGraphThunks(builder);
  },
});

export const graphReducer = graphSlice.reducer;

export const useGraphActions = () => {
  const dispatch = useAppDispatch();

  return useMemo(
    () =>
      bindActionCreators({ ...graphSlice.actions, ...graphThunks }, dispatch),
    [dispatch]
  );
};
