import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/services/auth";
import { supabaseAdmin } from "@/services/supabase";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const payload: any = {
      id: "default",
      default_seo_title: body.defaultSeoTitle,
      default_seo_description: body.defaultSeoDescription,
      rating_enabled: body.ratingEnabled ?? false,
      rating_label: body.ratingLabel,
      location_text: body.locationText,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabaseAdmin
      .from("site_settings")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      console.error("Supabase site_settings upsert error:", error);
      throw new Error("Failed to update site settings");
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
