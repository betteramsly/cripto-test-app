import { Link, Node } from "../../../feature/graph/types";

export function positionNewNodes(
  nodes: Node[],
  links: Link[],
  centerId: string,
  width: number,
  height: number
) {
  const cx = width / 2,
    cy = height / 2;
  const dx = 200,
    dy = 100;

  const sums = new Map<string, { sent: number; recv: number }>();
  links.forEach((l) => {
    if (l.sender === centerId) {
      sums.set(l.receiver, {
        ...(sums.get(l.receiver) || { sent: 0, recv: 0 }),
        recv: (sums.get(l.receiver)?.recv || 0) + l.usdt_amount,
      });
    }
    if (l.receiver === centerId) {
      sums.set(l.sender, {
        ...(sums.get(l.sender) || { sent: 0, recv: 0 }),
        sent: (sums.get(l.sender)?.sent || 0) + l.usdt_amount,
      });
    }
  });

  sums.forEach(({ sent, recv }, id) => {
    const node = nodes.find((n) => n.id === id);
    if (!node || node.x != null) return;

    const moreRecv = recv >= sent;
    node.x =
      cx + (moreRecv ? dx + Math.random() * 50 : -dx - Math.random() * 50);
    node.y = cy + (Math.random() - 0.5) * dy;
  });
}
