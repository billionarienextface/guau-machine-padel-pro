"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Lead, GridData } from "@/lib/types";
import GridMapVisualizer from "@/components/GridMapVisualizer";
import MapPNGGenerator from "@/components/MapPNGGenerator";

type Tab = "EXTRACCION" | "AUDITORIA" | "ATAQUE" | "FULFILLMENT" | "DUPLICACION";

const TABS: Tab[] = [
  "EXTRACCION",
  "AUDITORIA",
  "ATAQUE",
  "FULFILLMENT",
  "DUPLICACION",
];

interface Report {
  grid_score_before: number;
  grid_score_after: number;
  improvement: number;
  mrr_impact: number;
}

export default function Machine() {
  const [tab, setTab] = useState<Tab>("EXTRACCION");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("Miami, FL");
  const [query, setQuery] = useState("Padel Club");

  const [extractCount, setExtractCount] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [auditResults, setAuditResults] = useState<Record<string, GridData>>({});
  const [outreachMessages, setOutreachMessages] = useState<Record<string, string>>({});
  const [reports, setReports] = useState<Record<string, Report>>({});

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

  async function handleExtract() {
    setLoading(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, query }),
      });
      const data = await res.json();
      setExtractCount(data.count ?? null);
      await fetchLeads();
    } finally {
      setLoading(false);
    }
  }

  async function handleAudit(leadId: string) {
    setActionLoadingId(leadId);
    try {
      const res = await fetch(`/api/audit/${leadId}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setAuditResults((prev) => ({ ...prev, [leadId]: data.audit.grid_data }));
        await fetchLeads();
      }
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleOutreach(leadId: string, type: "email" | "whatsapp") {
    setActionLoadingId(leadId);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, type }),
      });
      const data = await res.json();
      setOutreachMessages((prev) => ({ ...prev, [leadId]: data.message }));
      await fetchLeads();
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReport(leadId: string) {
    setActionLoadingId(leadId);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) => ({ ...prev, [leadId]: data.report }));
      }
    } finally {
      setActionLoadingId(null);
    }
  }

  function TabButton({ name }: { name: Tab }) {
    return (
      <button
        onClick={() => setTab(name)}
        className={`px-4 py-2 rounded font-display uppercase tracking-wide text-sm transition ${
          tab === name ? "bg-[#FF6B00] text-black" : "bg-[#1a1a1a] text-white"
        }`}
      >
        {name}
      </button>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-white p-6 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/backgrounds/dashboard-texture.png')" }}
    >
      <h1 className="font-display text-3xl uppercase tracking-wide mb-6">
        GUAU MACHINE
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => (
          <TabButton key={t} name={t} />
        ))}
      </div>

      {tab === "EXTRACCION" && (
        <div className="space-y-4 max-w-md">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ciudad"
            className="bg-[#1a1a1a] border border-[#FF6B00] rounded px-4 py-2 text-white w-full"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Búsqueda"
            className="bg-[#1a1a1a] border border-[#FF6B00] rounded px-4 py-2 text-white w-full"
          />
          <button
            onClick={handleExtract}
            disabled={loading}
            className="bg-[#FF6B00] text-black px-6 py-3 rounded font-display uppercase tracking-wide disabled:opacity-50"
          >
            {loading ? "EXTRAYENDO..." : "EXTRAER 50 LEADS"}
          </button>
          {extractCount !== null && (
            <p className="text-white">Se extrajeron {extractCount} leads nuevos.</p>
          )}
        </div>
      )}

      {tab === "AUDITORIA" && (
        <div className="space-y-6">
          {leads
            .filter((l) => l.status === "NEW")
            .map((lead) => (
              <div
                key={lead.id}
                className="bg-[#1a1a1a] border border-[#FF6B00] rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="font-display uppercase text-white">
                    {lead.business_name}
                  </p>
                  <button
                    onClick={() => handleAudit(lead.id)}
                    disabled={actionLoadingId === lead.id}
                    className="bg-[#FF6B00] text-black px-4 py-2 rounded font-display uppercase text-sm disabled:opacity-50"
                  >
                    {actionLoadingId === lead.id ? "AUDITANDO..." : "AUDITAR"}
                  </button>
                </div>
                {auditResults[lead.id] && (
                  <div className="space-y-4">
                    <GridMapVisualizer
                      points={auditResults[lead.id].points}
                      score={auditResults[lead.id].score}
                      total={auditResults[lead.id].total}
                      businessName={lead.business_name}
                    />
                    <MapPNGGenerator
                      businessName={lead.business_name}
                      gridData={auditResults[lead.id]}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {tab === "ATAQUE" && (
        <div className="space-y-4">
          {leads
            .filter((l) => l.status === "AUDITED")
            .map((lead) => (
              <div
                key={lead.id}
                className="bg-[#1a1a1a] border border-[#FF6B00] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <p className="font-display uppercase text-white">
                  {lead.business_name}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOutreach(lead.id, "email")}
                    disabled={actionLoadingId === lead.id}
                    className="bg-[#FF6B00] text-black px-4 py-2 rounded font-display uppercase text-sm disabled:opacity-50"
                  >
                    ENVIAR EMAIL
                  </button>
                  <button
                    onClick={() => handleOutreach(lead.id, "whatsapp")}
                    disabled={actionLoadingId === lead.id}
                    className="bg-white text-black px-4 py-2 rounded font-display uppercase text-sm disabled:opacity-50"
                  >
                    WHATSAPP
                  </button>
                  {outreachMessages[lead.id] && (
                    <p className="text-green-500 text-xs">
                      {outreachMessages[lead.id]}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {tab === "FULFILLMENT" && (
        <div className="space-y-4">
          {leads
            .filter((l) => l.status === "CONTACTED" || l.status === "CALLED")
            .map((lead) => (
              <div
                key={lead.id}
                className="bg-[#1a1a1a] border border-[#FF6B00] rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-display uppercase text-white">
                    {lead.business_name}
                  </p>
                  <button
                    onClick={() => handleReport(lead.id)}
                    disabled={actionLoadingId === lead.id}
                    className="bg-[#FF6B00] text-black px-4 py-2 rounded font-display uppercase text-sm disabled:opacity-50"
                  >
                    GENERAR REPORTE
                  </button>
                </div>
                {reports[lead.id] && (
                  <div className="bg-[#0A0A0A] border border-gray-800 rounded p-4 mt-2 text-sm text-white space-y-1">
                    <p>Score antes: {reports[lead.id].grid_score_before}/25</p>
                    <p>Score después: {reports[lead.id].grid_score_after}/25</p>
                    <p>Mejora: +{reports[lead.id].improvement}</p>
                    <p className="text-[#FF6B00] font-bold">
                      Impacto MRR: ${reports[lead.id].mrr_impact}
                    </p>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {tab === "DUPLICACION" && (
        <div className="space-y-6 text-white max-w-xl">
          <p>
            Día 21: si el cliente mejora, se genera automáticamente un caso de
            éxito para Instagram.
          </p>
          <div className="bg-[#1a1a1a] border border-[#FF6B00] rounded-xl p-6">
            <p className="font-display uppercase text-lg mb-2">Fórmula MRR</p>
            <p className="text-sm text-gray-300">
              BASE $147 + LUXE $797 + ATELIER $6,000
            </p>
            <p className="text-sm text-gray-300 mt-2">
              Ejemplo: 3 LUXE ={" "}
              <span className="text-[#FF6B00] font-bold">$2,391 MRR</span>
            </p>
            <p className="text-sm text-gray-300 mt-2">
              Objetivo BRAWLER:{" "}
              <span className="text-[#FF0000] font-bold">$10,721/mes</span>
            </p>
          </div>
          <Link
            href="/clients"
            className="inline-block bg-[#FF6B00] text-black px-6 py-3 rounded font-display uppercase tracking-wide"
          >
            VER CLIENTS
          </Link>
        </div>
      )}
    </div>
  );
}
