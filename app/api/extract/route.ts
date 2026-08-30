import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const city = body.city || "Miami, FL";
    const query = body.query || "Padel Club";

    const levels = ["BASE", "LUXE", "ATELIER"] as const;
    const leads = Array.from({ length: 50 }, (_, i) => ({
      business_name: `${query} ${i + 1} Miami`,
      city,
      address: `${1000 + i} ${
        ["Biscayne Blvd", "NW Miami Ct", "NE 2nd Ave", "MacArthur Causeway"][
          i % 4
        ]
      }, Miami, FL 3313${i % 10}`,
      level: levels[Math.floor(Math.random() * 3)],
      status: "NEW" as const,
      grid_score_before: Math.floor(Math.random() * 7) + 3, // 3-9
    }));

    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert(leads)
      .select();
    if (error) throw error;

    return Response.json({ success: true, count: data.length, leads: data });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
