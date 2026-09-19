import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        defaultSeoTitle: body.defaultSeoTitle,
        defaultSeoDescription: body.defaultSeoDescription,
        ratingEnabled: body.ratingEnabled,
        ratingLabel: body.ratingLabel,
        locationText: body.locationText,
      },
      create: {
        id: "default",
        defaultSeoTitle: body.defaultSeoTitle,
        defaultSeoDescription: body.defaultSeoDescription,
        ratingEnabled: body.ratingEnabled,
        ratingLabel: body.ratingLabel,
        locationText: body.locationText,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
