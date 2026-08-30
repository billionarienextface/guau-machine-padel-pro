"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const PLAN_MRR: Record<string, number> = { BASE: 147, LUXE: 797, ATELIER: 5000 };

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

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  async function fetchData() {
    const { data: clientsData } = await supabase
      .from("clients")
      .select("*, leads(*)");
    if (clientsData) setClients(clientsData);

    const { data: leadsData } = await supabase
      .from("leads")
      .select("*")
      .eq("status", "CLIENT");
    if (leadsData) setLeads(leadsData);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const mrrTotal =
    clients.length > 0
      ? clients.reduce((sum, c) => sum + (c.mrr || 0), 0)
      : leads.reduce((sum, l) => sum + (PLAN_MRR[l.level] || 0), 0);

  function countByPlan(plan: string): number {
    if (clients.length > 0) return clients.filter((c) => c.plan === plan).length;
    return leads.filter((l) => l.level === plan).length;
  }

  const baseCount = countByPlan("BASE");
  const luxeCount = countByPlan("LUXE");
  const atelierCount = countByPlan("ATELIER");

  const baseMrr = baseCount * PLAN_MRR.BASE;
  const luxeMrr = luxeCount * PLAN_MRR.LUXE;
  const atelierMrr = atelierCount * PLAN_MRR.ATELIER;

  const maxMrr = Math.max(baseMrr, luxeMrr, atelierMrr, 1);

  async function handleAddClient() {
    const randomLeadId =
      leads.length > 0
        ? leads[Math.floor(Math.random() * leads.length)].id
        : crypto.randomUUID();
    await supabase
      .from("clients")
      .insert({ lead_id: randomLeadId, plan: "LUXE", mrr: 797 });
    await fetchData();
  }

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-white p-6 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/backgrounds/dashboard-texture.png')" }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="font-display text-3xl uppercase tracking-wide">
          CLIENTS{" "}
          <span className="text-[#FF6B00]">
            • MRR ${mrrTotal.toLocaleString()}
          </span>
        </h1>
        <p className="text-sm text-gray-400 uppercase tracking-wide">
          Objetivo BRAWLER:{" "}
          <span className="text-[#FF0000] font-bold">$10,721</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a1a1a] border border-gray-600 rounded-xl p-6">
          <p className="text-gray-400 uppercase text-xs mb-2">BASE</p>
          <p className="font-display text-3xl text-white">{baseCount}</p>
          <p className="text-gray-400 text-sm mt-1">
            ${baseMrr.toLocaleString()} MRR
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#FF6B00] rounded-xl p-6">
          <p className="text-[#FF6B00] uppercase text-xs mb-2">LUXE</p>
          <p className="font-display text-3xl text-white">{luxeCount}</p>
          <p className="text-gray-400 text-sm mt-1">
            ${luxeMrr.toLocaleString()} MRR
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#FF0000] rounded-xl p-6">
          <p className="text-[#FF0000] uppercase text-xs mb-2">ATELIER</p>
          <p className="font-display text-3xl text-white">{atelierCount}</p>
          <p className="text-gray-400 text-sm mt-1">
            ${atelierMrr.toLocaleString()} MRR
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2 h-32 mb-8">
        <div
          className="flex-1 bg-gray-600 rounded-t"
          style={{ height: `${(baseMrr / maxMrr) * 100}%` }}
        />
        <div
          className="flex-1 bg-[#FF6B00] rounded-t"
          style={{ height: `${(luxeMrr / maxMrr) * 100}%` }}
        />
        <div
          className="flex-1 bg-[#FF0000] rounded-t"
          style={{ height: `${(atelierMrr / maxMrr) * 100}%` }}
        />
      </div>

      <div className="bg-[#1a1a1a] border border-[#FF6B00] rounded-xl p-6 mb-8">
        <p className="font-display uppercase text-lg mb-2">Ejemplo</p>
        <p className="text-sm text-gray-300">
          3 LUXE = <span className="text-[#FF6B00] font-bold">$2,391 MRR</span>
        </p>
        <p className="text-sm text-gray-300 mt-1">
          Fórmula: BASE $147 + LUXE $797 + ATELIER $5,000
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display uppercase text-xl">Clientes</h2>
        <button
          onClick={handleAddClient}
          className="bg-[#FF6B00] text-black px-6 py-3 rounded font-display uppercase tracking-wide"
        >
          AÑADIR CLIENTE
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-[#1a1a1a] rounded text-white text-sm">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs border-b border-gray-800">
              <th className="p-3">Business</th>
              <th className="p-3">Plan</th>
              <th className="p-3">MRR</th>
              <th className="p-3">Desde</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-gray-800">
                <td className="p-3 font-display uppercase">
                  {c.leads?.business_name || "—"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${levelBadgeClass(
                      c.plan
                    )}`}
                  >
                    {c.plan}
                  </span>
                </td>
                <td className="p-3 text-[#FF6B00] font-bold">${c.mrr}</td>
                <td className="p-3 text-gray-400">
                  {c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
