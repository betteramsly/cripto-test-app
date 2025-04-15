import { useEffect, useRef } from "react";

import * as d3 from "d3";
import { Node } from "../feature/graph/types";
import { loadGraph } from "../feature/graph/graphActions";
import { useAppDispatch, useAppSelector } from "../app/store";

export const GraphCanvas = () => {
  const dispatch = useAppDispatch();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const { nodes, links } = useAppSelector((state) => state.graph);
  console.log(nodes);
  // вынести в хук
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const g = svg.append("g");

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        })
    );

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const simulationLinks: d3.SimulationLinkDatum<Node>[] = links.map(
      (link) => ({
        ...link,
        source: nodeMap.get(link.sender)!,
        target: nodeMap.get(link.receiver)!,
      })
    );

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, d3.SimulationLinkDatum<Node>>(simulationLinks)
          .id((d) => d.id)
          .distance(200)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(simulationLinks)
      .join("line")
      .attr("stroke-width", 2);

    const node = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll<SVGCircleElement, Node>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d) =>
        d.type === "user" ? "#1f77b4" : d.type === "cex" ? "#ff7f0e" : "#2ca02c"
      )
      .call(drag(simulation))
      .on("dblclick", (_, d) => {
        dispatch(loadGraph(d.id));
      });

    const label = g
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .text((d) => d.name || d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

      label.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });
    setTimeout(() => {
      simulation.alpha(1).restart();
    }, 100);
  }, [nodes, links]);

  return (
    <svg
      ref={svgRef}
      width={800}
      height={600}
      style={{ border: "2px solid black" }}
    />
  );
};

function drag(simulation: d3.Simulation<Node, undefined>) {
  return d3
    .drag<SVGCircleElement, Node>()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}
