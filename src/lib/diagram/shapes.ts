import { BlockShape } from "@/types/diagram";

// Returns an SVG path string for the given shape within a width×height box.
// Coordinates are in local SVG space (0,0 = top-left).
export function getShapePath(shape: BlockShape, width: number, height: number): string {
  const w = Math.max(20, width);
  const h = Math.max(20, height);

  switch (shape) {
    case "rectangle":
      return `M 0 0 H ${w} V ${h} H 0 Z`;

    case "rounded":
      return roundedRectPath(w, h, Math.min(16, Math.min(w, h) / 4));

    case "circle": {
      const r = Math.min(w, h) / 2;
      const cx = w / 2;
      const cy = h / 2;
      return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
    }

    case "ellipse": {
      const rx = w / 2;
      const ry = h / 2;
      const cx = w / 2;
      const cy = h / 2;
      return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
    }

    case "diamond":
      return `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`;

    case "parallelogram": {
      const skew = Math.min(30, w * 0.15);
      return `M ${skew} 0 L ${w} 0 L ${w - skew} ${h} L 0 ${h} Z`;
    }

    case "hexagon": {
      const inset = Math.min(30, w * 0.18);
      return `M ${inset} 0 L ${w - inset} 0 L ${w} ${h / 2} L ${w - inset} ${h} L ${inset} ${h} L 0 ${h / 2} Z`;
    }

    case "triangle":
      return `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`;

    case "cylinder": {
      const ry = Math.min(12, h * 0.12);
      return `M 0 ${ry} a ${w / 2} ${ry} 0 0 0 ${w} 0 a ${w / 2} ${ry} 0 0 0 ${-w} 0 M 0 ${ry} V ${h - ry} a ${w / 2} ${ry} 0 0 0 ${w} 0 V ${ry}`;
    }

    case "document": {
      const wave = h * 0.15;
      return `M 0 0 L ${w} 0 L ${w} ${h - wave} Q ${w * 0.75} ${h + wave * 0.6} ${w / 2} ${h - wave * 0.4} Q ${w * 0.25} ${h - wave * 1.4} 0 ${h - wave} Z`;
    }

    case "terminator":
      return roundedRectPath(w, h, Math.min(h / 2, 30));

    default:
      return `M 0 0 H ${w} V ${h} H 0 Z`;
  }
}

function roundedRectPath(w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h / 2);
  return `M ${rr} 0 H ${w - rr} Q ${w} 0 ${w} ${rr} V ${h - rr} Q ${w} ${h} ${w - rr} ${h} H ${rr} Q 0 ${h} 0 ${h - rr} V ${rr} Q 0 0 ${rr} 0 Z`;
}

// Returns a Tailwind/CSS-like filter string for drop-shadow.
export function shadowFilter(enabled?: boolean): string {
  return enabled ? "drop-shadow(0 4px 6px rgba(15, 23, 42, 0.08)) drop-shadow(0 2px 4px rgba(15, 23, 42, 0.06))" : "none";
}
