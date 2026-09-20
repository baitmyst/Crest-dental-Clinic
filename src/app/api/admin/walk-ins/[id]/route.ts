import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/services/auth";
import { updateWalkInStatus } from "@/services/walk-ins";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  assignedDentistId: z.string().optional().nullable(),
  staffNotes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    const { id } = await context.params;
    const body = await req.json();
    const validated = updateSchema.parse(body);

    const updated = await updateWalkInStatus(id, {
      status: validated.status as any,
      assignedDentistId: validated.assignedDentistId,
      staffNotes: validated.staffNotes,
    });

    return NextResponse.json({
      success: true,
      walkIn: updated,
    });
  } catch (error: any) {
    console.error("PATCH Walk-in error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid update payload" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update walk-in" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
