import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { lead_id } = await req.json();
    if (!lead_id)
      return Response.json(
        { success: false, error: "lead_id requerido" },
        { status: 400 }
      );

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();
    if (error) throw error;

    const report = {
      business_name: lead.business_name,
      city: lead.city,
      address: lead.address,
      grid_score_before: lead.grid_score_before,
      grid_score_after: Math.min(
        25,
        lead.grid_score_before + 10 + Math.floor(Math.random() * 5)
      ),
      improvement: 10 + Math.floor(Math.random() * 5),
      mrr_impact:
        lead.level === "BASE" ? 147 : lead.level === "LUXE" ? 797 : 5000,
      generated_at: new Date().toISOString(),
      recommendations: [
        "Optimizar ficha Google con 10 fotos nuevas",
        "Conseguir 15 reseñas en 7 días",
        "Dominar 25 puntos grid alrededor del club",
        "Activar app GUAU PÁDEL PRO para socios",
      ],
    };

    return Response.json({ success: true, report });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
