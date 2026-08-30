import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    // Genera 25 puntos Miami: lat 25.7-25.8, lng -80.1--80.2, rank 1-20
    const points = Array.from({ length: 25 }, () => ({
      rank: Math.floor(Math.random() * 20) + 1,
      lat: 25.7 + Math.random() * 0.1,
      lng: -80.2 + Math.random() * 0.1,
    }));
    const score = points.filter((p) => p.rank <= 3).length;
    const grid_data = { points, score, total: 25 };

    const { data: audit, error: auditError } = await supabaseAdmin
      .from("audits")
      .insert({ lead_id: leadId, grid_data })
      .select()
      .single();
    if (auditError) throw auditError;

    const { error: leadError } = await supabaseAdmin
      .from("leads")
      .update({ status: "AUDITED", grid_score_before: score })
      .eq("id", leadId);
    if (leadError) throw leadError;

    return Response.json({ success: true, audit });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
