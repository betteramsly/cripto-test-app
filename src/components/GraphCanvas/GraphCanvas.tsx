import { useRef } from "react";

import { useAppSelector } from "../../app/store";
import { shallowEqual } from "react-redux";

import { useGraphRenderer } from "./useGraphRenderer.ts";

type IProps = {
  selectedAddress: string | null;
  displayMode: "token" | "usd";
  handleFetchGraphData: (address: string) => void;
};

export const GraphCanvas = ({
  selectedAddress,
  displayMode,
  handleFetchGraphData,
}: IProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { nodes, links } = useAppSelector((state) => state.graph, shallowEqual);

  useGraphRenderer(
    svgRef,
    nodes,
    links,
    selectedAddress,
    displayMode,
    handleFetchGraphData
  );

  return <svg ref={svgRef} width={800} height={600} />;
};
