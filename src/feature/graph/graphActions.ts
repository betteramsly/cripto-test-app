import { Dispatch } from "redux";
import { graphApi } from "./graph.api";
import { GraphResponse } from "./types";
import { AxiosError, AxiosResponse } from "axios";

export const LOAD_GRAPH_REQUEST = "LOAD_GRAPH_REQUEST";
export const LOAD_GRAPH_SUCCESS = "LOAD_GRAPH_SUCCESS";
export const LOAD_GRAPH_FAILURE = "LOAD_GRAPH_FAILURE";

export type GraphAction =
  | { type: typeof LOAD_GRAPH_REQUEST }
  | { type: typeof LOAD_GRAPH_SUCCESS; payload: GraphResponse }
  | { type: typeof LOAD_GRAPH_FAILURE; error: string };

export const loadGraph =
  (address: string) => async (dispatch: Dispatch<GraphAction>) => {
    dispatch({ type: LOAD_GRAPH_REQUEST });

    try {
      const response: AxiosResponse<GraphResponse> =
        await graphApi.fetchGraphByAddress(address);
      const data = response.data;

      dispatch({ type: LOAD_GRAPH_SUCCESS, payload: data });
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.message || "Unexpected error occurred";
      dispatch({ type: LOAD_GRAPH_FAILURE, error: errorMessage });
    }
  };
