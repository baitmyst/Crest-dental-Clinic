import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { isVerified, startTime, endTime } = await req.json();

    const friday = await prisma.workingHours.findFirst({
      where: { dayOfWeek: 5 },
    });

    if (!friday) {
      return NextResponse.json({ error: "Friday schedule not found" }, { status: 404 });
    }

    const updated = await prisma.workingHours.update({
      where: { id: friday.id },
      data: {
        isVerified: isVerified !== undefined ? isVerified : true,
        isAvailable: isVerified !== undefined ? isVerified : true,
        startTime: startTime || friday.startTime,
        endTime: endTime || friday.endTime,
      },
    });

    return NextResponse.json({ success: true, friday: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
