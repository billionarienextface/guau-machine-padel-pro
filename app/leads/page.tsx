"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Lead, LeadStatus } from "@/lib/types";
import KanbanBoard from "@/components/KanbanBoard";
import GridMapVisualizer from "@/components/GridMapVisualizer";

const STATUS_OPTIONS: (LeadStatus | "ALL")[] = [
  "ALL",
  "NEW",
  "AUDITED",
  "CONTACTED",
  "CALLED",
  "CLOSED",
  "CLIENT",
];
const LEVEL_OPTIONS = ["ALL", "BASE", "LUXE", "ATELIER"];

function levelBadgeClass(level: string): string {
  switch (level) {
    case "LUXE":
      return "bg-[#FF6B00] text-black";
    case "ATELIER":
      return "bg-[#FF0000] text-white";
    default:
      return "bg-gray-600 text-white";
  }
}

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    NEW: "bg-gray-600",
    AUDITED: "bg-blue-600",
    CONTACTED: "bg-yellow-600",
    CALLED: "bg-purple-600",
    CLOSED: "bg-green-600",
    CLIENT: "bg-[#FF6B00] text-black",
  };
  return map[status] || "bg-gray-600";
}

function scoreColor(score: number): string {
  if (score >= 12) return "text-green-500";
  if (score >= 8) return "text-orange-500";
  return "text-red-500";
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [auditingId, setAuditingId] = useState<string | null>(null);
  const [mapModalLead, setMapModalLead] = useState<Lead | null>(null);

  async function fetchLeads() {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLeads(data as Lead[]);
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = leads.filter((l) => {
    if (filterStatus !== "ALL" && l.status !== filterStatus) return false;
    if (filterLevel !== "ALL" && l.level !== filterLevel) return false;
    if (
      search &&
      !l.business_name.toLowerCase().includes(search.toLowerCase()) &&
      !l.city.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  async function handleStatusChange(id: string, newStatus: LeadStatus) {
    await supabase.from("leads").update({ status: newStatus }).eq("id", id);
    await fetchLeads();
  }

  async function handleExtractMore() {
    setExtracting(true);
    try {
      await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchLeads();
    } finally {
      setExtracting(false);
    }
  }

  async function handleAuditRow(id: string) {
    setAuditingId(id);
    try {
      await fetch(`/api/audit/${id}`, { method: "POST" });
      await fetchLeads();
    } finally {
      setAuditingId(null);
    }
  }

  return (
    <div
      className="min-h-screen text-white p-6 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/backgrounds/aerial-padel-court.png')" }}
    >
      <div className="absolute inset-0 bg-black/75"></div>
      <div className="relative z-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="font-display text-3xl uppercase tracking-wide">
          LEADS <span className="text-[#FF6B00]">• {leads.length} CLUBS</span>
        </h1>
        <button
          onClick={handleExtractMore}
          disabled={extracting}
          className="bg-[#FF6B00] text-black px-6 py-3 rounded font-display uppercase tracking-wide disabled:opacity-50"
        >
          {extracting ? "EXTRAYENDO..." : "EXTRAER MÁS"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="bg-[#1a1a1a] border border-[#FF6B00] rounded px-4 py-2 text-white flex-1"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1a1a1a] border border-[#FF6B00] rounded px-4 py-2 text-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="bg-[#1a1a1a] border border-[#FF6B00] rounded px-4 py-2 text-white"
        >
          {LEVEL_OPTIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <KanbanBoard leads={filtered} onStatusChange={handleStatusChange} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-[#1a1a1a] rounded text-white text-sm">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs border-b border-gray-800">
              <th className="p-3">Business</th>
              <th className="p-3">City</th>
              <th className="p-3">Address</th>
              <th className="p-3">Level</th>
              <th className="p-3">Status</th>
              <th className="p-3">Score</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-gray-800">
                <td className="p-3 font-display uppercase">{lead.business_name}</td>
                <td className="p-3">{lead.city}</td>
                <td className="p-3 text-gray-400 truncate max-w-[200px]">
                  {lead.address}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${levelBadgeClass(
                      lead.level
                    )}`}
                  >
                    {lead.level}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${statusBadgeClass(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className={`p-3 font-bold ${scoreColor(lead.grid_score_before)}`}>
                  {lead.grid_score_before}/25
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => setMapModalLead(lead)}
                    className="bg-white text-black px-3 py-1 rounded text-xs font-display uppercase"
                  >
                    Ver Mapa
                  </button>
                  <button
                    onClick={() => handleAuditRow(lead.id)}
                    disabled={auditingId === lead.id}
                    className="bg-[#FF6B00] text-black px-3 py-1 rounded text-xs font-display uppercase disabled:opacity-50"
                  >
                    {auditingId === lead.id ? "..." : "Auditar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {mapModalLead && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setMapModalLead(null)}
        >
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <GridMapVisualizer businessName={mapModalLead.business_name} />
            <button
              onClick={() => setMapModalLead(null)}
              className="mt-4 bg-white text-black px-4 py-2 rounded font-display uppercase"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
