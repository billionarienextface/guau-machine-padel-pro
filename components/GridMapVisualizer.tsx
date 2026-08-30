import { GridPoint } from "@/lib/types";

interface GridMapVisualizerProps {
  points?: GridPoint[];
  score?: number;
  total?: number;
  businessName?: string;
}

function generateMockPoints(): GridPoint[] {
  return Array.from({ length: 25 }, () => ({
    rank: Math.floor(Math.random() * 20) + 1,
  }));
}

export default function GridMapVisualizer({
  points,
  score,
  total = 25,
  businessName,
}: GridMapVisualizerProps) {
  const gridPoints = points && points.length > 0 ? points : generateMockPoints();
  const computedScore =
    score !== undefined
      ? score
      : gridPoints.filter((p) => p.rank <= 3).length;

  const progressPercent = (computedScore / total) * 100;
  const progressColor = computedScore >= 12 ? "bg-green-500" : "bg-orange-500";

  let visibilityLabel = "MEDIO";
  let visibilityColor = "text-guau-orange";
  if (computedScore >= 15) {
    visibilityLabel = "VISIBLE";
    visibilityColor = "text-green-500";
  } else if (computedScore < 8) {
    visibilityLabel = "INVISIBLE";
    visibilityColor = "text-guau-red";
  }

  return (
    <div className="bg-guau-black border border-guau-orange rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-display uppercase tracking-wide text-white text-xl">
            {businessName || "Wynwood Padel Club"}
          </h3>
          <p className="text-white text-sm mt-1">
            {computedScore}/{total} Top3{" "}
            <span className={`font-bold ${visibilityColor}`}>
              {visibilityLabel}
            </span>
          </p>
        </div>
        <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {gridPoints.map((point, index) => (
          <div
            key={index}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
              point.rank <= 3
                ? "bg-green-500 text-white border-green-300 shadow-green-500/50 shadow-lg"
                : "bg-red-500 text-white border-red-300"
            }`}
          >
            {point.rank}
          </div>
        ))}
      </div>
    </div>
  );
}
