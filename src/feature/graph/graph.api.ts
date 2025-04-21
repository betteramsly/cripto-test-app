import { GraphResponse } from "./types";
import { axiosInstance } from "../../app/axios";
import { AxiosResponse } from 'axios'

export const graphApi = {
  fetchGraphByAddress: (address: string): Promise<AxiosResponse<GraphResponse>> =>
    axiosInstance.post("/messages", { address }),
};
