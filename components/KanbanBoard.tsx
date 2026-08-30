"use client";

import { Lead, LeadStatus } from "@/lib/types";

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (id: string, newStatus: LeadStatus) => void;
}

const columns: LeadStatus[] = [
  "NEW",
  "AUDITED",
  "CONTACTED",
  "CALLED",
  "CLOSED",
];

function getLeadsByStatus(leads: Lead[], status: LeadStatus): Lead[] {
  if (status === "CLOSED") {
    return leads.filter((l) => l.status === "CLOSED" || l.status === "CLIENT");
  }
  return leads.filter((l) => l.status === status);
}

function levelBadgeClass(level: Lead["level"]): string {
  switch (level) {
    case "LUXE":
      return "bg-guau-orange text-black";
    case "ATELIER":
      return "bg-guau-red text-white";
    default:
      return "bg-gray-600 text-white";
  }
}

function scoreColorClass(score: number): string {
  if (score >= 12) return "text-green-500";
  if (score >= 8) return "text-orange-500";
  return "text-red-500";
}

export default function KanbanBoard({ leads, onStatusChange }: KanbanBoardProps) {
  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData("leadId", leadId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    onStatusChange(leadId, status);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((status) => {
        const columnLeads = getLeadsByStatus(leads, status);
        return (
          <div
            key={status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
            className="min-w-[250px] bg-[#0f0f0f] rounded-xl p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-display uppercase tracking-wide text-white text-sm">
                {status}
              </span>
              <span className="bg-guau-orange text-black rounded-full px-2 text-xs font-bold">
                {columnLeads.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="bg-[#1a1a1a] border border-guau-orange rounded-lg p-4 cursor-move hover:border-white transition"
                >
                  <p className="font-display text-white uppercase text-sm">
                    {lead.business_name}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs mt-2 ${levelBadgeClass(
                      lead.level
                    )}`}
                  >
                    {lead.level}
                  </span>
                  <p
                    className={`text-xs mt-2 font-bold ${scoreColorClass(
                      lead.grid_score_before
                    )}`}
                  >
                    {lead.grid_score_before}/25
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {lead.city}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
