"use client";

import { useRef, useState, useEffect } from "react";
import { GridData } from "@/lib/types";

interface MapPNGGeneratorProps {
  businessName: string;
  gridData: GridData;
  onGenerated?: (dataUrl: string) => void;
}

export default function MapPNGGenerator({
  businessName,
  gridData,
  onGenerated,
}: MapPNGGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function generate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsGenerating(true);

    canvas.width = 1200;
    canvas.height = 800;

    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellW = 1200 / 5;
    const cellH = 600 / 5;

    gridData.points.forEach((point, index) => {
      const x = (index % 5) * cellW + cellW / 2;
      const y = 100 + Math.floor(index / 5) * cellH + cellH / 2;

      ctx.beginPath();
      ctx.arc(x, y, 35, 0, Math.PI * 2);
      ctx.fillStyle = point.rank <= 3 ? "#22c55e" : "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(point.rank), x, y);
    });

    ctx.fillStyle = "#ffffff";
    ctx.font = "40px Anton";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(
      `${businessName} - ${gridData.score}/${gridData.total} Top3`,
      canvas.width / 2,
      60
    );

    ctx.fillStyle = "#FF6B00";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "GUAU 🐕‍🦺 LENTES ROJOS - Lujo que ladra - De invisible a inevitable",
      canvas.width / 2,
      760
    );

    const url = canvas.toDataURL();
    setDataUrl(url);
    setIsGenerating(false);
    onGenerated?.(url);
  }

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridData]);

  return (
    <div className="bg-guau-black border border-guau-orange rounded-xl p-6">
      <canvas ref={canvasRef} className="hidden" />

      {dataUrl && (
        <img src={dataUrl} alt={businessName} className="w-full rounded border" />
      )}

      <div className="flex gap-4 mt-4">
        <button
          onClick={generate}
          disabled={isGenerating}
          className="bg-guau-orange text-black px-6 py-3 rounded font-display uppercase disabled:opacity-50"
        >
          {isGenerating ? "GENERANDO..." : "GENERAR PNG"}
        </button>

        {dataUrl && (
          <a
            href={dataUrl}
            download={`${businessName}-mapa-25.png`}
            className="bg-white text-black px-6 py-3 rounded font-display uppercase"
          >
            DESCARGAR
          </a>
        )}
      </div>
    </div>
  );
}
