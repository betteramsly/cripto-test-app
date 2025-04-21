import * as d3 from "d3";
import { Node, Link } from "../../feature/graph/types";
import { positionNewNodes } from "./utils/positioning";
import { useEffect } from "react";

export interface CustomSimulationLink extends d3.SimulationLinkDatum<Node> {
  usdt_amount: number;
  tokens_amount: {
    usdt_amount: number;
    name: string;
    amount: number;
  }[];
  sender: string;
  receiver: string;
}

export function useGraphRenderer(
  svgRef: React.RefObject<SVGSVGElement | null>,
  nodes: Node[],
  links: Link[],
  selectedAddress: string | null,
  displayMode: "token" | "usd",
  handleFetchGraphData: (address: string) => void
) {
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
        .filter((event) => {
          return !(event.type === "dblclick");
        })
    );

    // const nodesToGroup = selectedAddress
    //   ? nodes.filter((n) => n.id !== selectedAddress).map((n) => n.id)
    //   : [];

    // const { groupedNodes, groupedLinks } = groupNodes(
    //   nodes,
    //   links,
    //   nodesToGroup
    // );

    // 2. Применяем функцию группировки
    const mutableNodes = nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(mutableNodes.map((n) => [n.id, n]));

    // Сгруппировать все links по ключу sender|receiver
    const linkKey = (l: Link) => `${l.sender}|${l.receiver}`;
    const aggregated: Record<string, CustomSimulationLink> = {};

    links.forEach((l) => {
      const key = linkKey(l);
      if (!aggregated[key]) {
        aggregated[key] = {
          ...l,
          source: nodeMap.get(l.sender)!,
          target: nodeMap.get(l.receiver)!,
          usdt_amount: l.usdt_amount,
          tokens_amount: l.tokens_amount.map((t) => ({ ...t })),
          sender: l.sender,
          receiver: l.receiver,
        };
      } else {
        aggregated[key].usdt_amount += l.usdt_amount;
        l.tokens_amount.forEach((t) => {
          const ex = aggregated[key].tokens_amount.find(
            (x) => x.name === t.name
          );
          if (ex) ex.amount += t.amount;
          else aggregated[key].tokens_amount.push({ ...t });
        });
      }
    });

    const simulationLinks = Object.values(aggregated);

    // Расположить контрагентов относительно исследуемого адреса: отправителей слева, получателей справа, с учётом преобладающего направления переводов.
    if (selectedAddress) {
      positionNewNodes(
        mutableNodes,
        simulationLinks,
        selectedAddress,
        width,
        height
      );
    }

    // Если исследуемого адреса еще нет на графе, для него выбирается свободное место
    // Ноды, которые уже отрисованы на графе, но при этом связаны с исследуемым адресом, НЕ ИЗМЕНЯЮТ своего положения.
    mutableNodes.forEach((node) => {
      if (node.x == null || node.y == null) {
        node.x = width / 2 + (Math.random() - 0.5) * 200;
        node.y = height / 2 + (Math.random() - 0.5) * 200;
      }
    });

    if (selectedAddress) {
      const selectedNode = mutableNodes.find((n) => n.id === selectedAddress);
      if (selectedNode) {
        selectedNode.fx = width / 2;
        selectedNode.fy = height / 2;
      }
    }

    const simulation = d3
      .forceSimulation(mutableNodes)
      .force(
        "link",
        d3
          .forceLink<Node, d3.SimulationLinkDatum<Node>>(simulationLinks)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));
console.log(simulationLinks, links)
    const linkGroup = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(simulationLinks)
      .join("line")
      .attr("stroke-width", 2);

    const linkLabels = g
      .append("g")
      .selectAll("text")
      .data(simulationLinks)
      .join("text")
      .attr("font-size", 10)
      .attr("fill", "#555")
      .text((d) =>
        displayMode === "usd"
          ? `${d.usdt_amount.toFixed(0)}$`
          : `${d.tokens_amount
              .map((token) => `${token.name}: ${token.amount.toFixed(0)}`)
              .join(", ")} токенов`
      );

    const nodeGroup = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll<SVGCircleElement, Node>("circle")
      .data(mutableNodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d) =>
        d.type === "user" ? "#1f77b4" : d.type === "cex" ? "#ff7f0e" : "#2ca02c"
      )
      .call(drag(simulation))
      .on("dblclick", (_, d) => {
        handleFetchGraphData(d.id);
      });

    const nodeLabels = g
      .append("g")
      .selectAll("text")
      .data(mutableNodes)
      .join("text")
      .attr("dy", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("pointer-events", "none")
      .style("font-weight", (d) =>
        d.id === selectedAddress ? "bold" : "normal"
      )
      .style("text-shadow", "1px 1px 2px white, -1px -1px 2px white")
      .text((d) => {
        const name = d.name;
        const balance =
          displayMode === "usd"
            ? `${d.usdt_balance.toFixed(0)}$`
            : d.tokens
                .map((t) => `${t.amount.toFixed(0)} ${t.name}`)
                .join(", ");
        return `${name} (${balance})`;
      });

    simulation.on("tick", () => {
      linkGroup
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);

      linkLabels
        .attr("x", (d) => ((d.source as Node).x! + (d.target as Node).x!) / 2)
        .attr("y", (d) => ((d.source as Node).y! + (d.target as Node).y!) / 2);

      nodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

      nodeLabels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });
   
    setTimeout(() => {
      simulation.alpha(1).restart();
    }, 100);
  }, [nodes, links, displayMode]);
}

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
