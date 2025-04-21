import { Link, Node } from "../../../feature/graph/types";

export function groupNodes(
  nodes: Node[],
  links: Link[],
  idsToGroup: string[]
): { nodes: Node[]; links: Link[]; groupId: string } {
  if (idsToGroup.length === 0) return { nodes, links, groupId: "" };

  const groupId = `group-${crypto.randomUUID()}`;
  const set = new Set(idsToGroup);

  const agg = nodes
    .filter((n) => set.has(n.id))
    .reduce(
      (acc, n) => {
        acc.usdt_balance += n.usdt_balance;
        n.tokens.forEach((t) =>
          acc.tokensMap.set(t.name, (acc.tokensMap.get(t.name) || 0) + t.amount)
        );
        acc.members.push(n.id);
        return acc;
      },
      {
        usdt_balance: 0,
        tokensMap: new Map<string, number>(),
        members: [] as string[],
      }
    );

  const groupedNode: Node = {
    id: groupId,
    name: `Group (${agg.members.length})`,
    type: "group",
    usdt_balance: agg.usdt_balance,
    tokens: Array.from(agg.tokensMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      usdt_amount: 0,
    })),
  };

  const newNodes = nodes.filter((n) => !set.has(n.id)).concat(groupedNode);

  const linkKey = (s: string, t: string) => `${s}|${t}`;
  const map = new Map<string, Link>();

  links.forEach((l) => {
    const s = set.has(l.sender) ? groupId : l.sender;
    const t = set.has(l.receiver) ? groupId : l.receiver;
    if (s === t) return;

    const key = linkKey(s, t);
    if (!map.has(key)) {
      map.set(key, { ...l, sender: s, receiver: t });
    } else {
      const ex = map.get(key)!;
      ex.usdt_amount += l.usdt_amount;
      l.tokens_amount.forEach((tk) => {
        const found = ex.tokens_amount.find((x) => x.name === tk.name);
        if (found) found.amount += tk.amount;
        else ex.tokens_amount.push({ ...tk });
      });
    }
  });

  return {
    nodes: newNodes,
    links: Array.from(map.values()),
    groupId,
  };
}

export function ungroupNodes(
  nodes: Node[],
  links: Link[],
  groupId: string
): { nodes: Node[]; links: Link[] } {
  const group = nodes.find((n) => n.id === groupId);
  if (!group || group.type !== "group") return { nodes, links };

  //   const count = parseInt(group.name.match(/\d+/)?.[0] || "0", 10);

  return { nodes, links };
}
