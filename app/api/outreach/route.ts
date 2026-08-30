import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { lead_id, type } = await req.json();
    if (!lead_id || !type)
      return Response.json(
        { success: false, error: "lead_id y type requeridos" },
        { status: 400 }
      );

    const newStatus =
      type === "email" ? "CONTACTED" : type === "whatsapp" ? "CALLED" : "CONTACTED";

    const { data: lead, error: fetchError } = await supabaseAdmin
      .from("leads")
      .select("business_name")
      .eq("id", lead_id)
      .single();
    if (fetchError) throw fetchError;

    const { error: updateError } = await supabaseAdmin
      .from("leads")
      .update({ status: newStatus })
      .eq("id", lead_id);
    if (updateError) throw updateError;

    // Mock, no envía real
    return Response.json({
      success: true,
      message: `${type} mock enviado a ${lead.business_name}`,
      status: newStatus,
    });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
