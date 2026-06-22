import type { ColorCancha } from "@/types";

const colorMap: Record<ColorCancha, { dot: string; label: string }> = {
  azul:    { dot: "bg-blue-500",   label: "Azul" },
  violeta: { dot: "bg-purple-500", label: "Violeta" },
  roja:    { dot: "bg-red-500",    label: "Roja" },
};

export default function CanchaColorBadge({ color }: { color: ColorCancha }) {
  const { dot, label } = colorMap[color];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  );
}
