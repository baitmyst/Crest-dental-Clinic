import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/services/auth";
import { registerWalkInPatient, getWalkIns } from "@/services/walk-ins";

export const dynamic = "force-dynamic";

const walkInSchema = z.object({
  fullName: z.string().min(2, "Full name is required (at least 2 characters)"),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z.string().email().optional().nullable().or(z.literal("")),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  serviceId: z.string().min(1, "Service selection is required"),
  assignedDentistId: z.string().optional().nullable(),
  priority: z.enum(["ROUTINE", "URGENT", "EMERGENCY"]).default("ROUTINE"),
  chiefComplaint: z.string().optional().nullable(),
  bloodPressure: z.string().optional().nullable(),
  temperature: z.string().optional().nullable(),
  staffNotes: z.string().optional().nullable(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).default("CONFIRMED"),
});

export async function GET(req: NextRequest) {
  try {
    await requireStaff();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;

    const walkIns = await getWalkIns(date);
    return NextResponse.json({ success: true, walkIns });
  } catch (error: any) {
    console.error("GET Walk-ins error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve walk-in patients" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStaff();
    const body = await req.json();
    const validated = walkInSchema.parse(body);

    const result = await registerWalkInPatient({
      fullName: validated.fullName,
      phone: validated.phone,
      email: validated.email || null,
      dateOfBirth: validated.dateOfBirth || null,
      gender: validated.gender || null,
      emergencyContact: validated.emergencyContact || null,
      serviceId: validated.serviceId,
      assignedDentistId: validated.assignedDentistId || null,
      priority: validated.priority,
      chiefComplaint: validated.chiefComplaint || null,
      vitals:
        validated.bloodPressure || validated.temperature
          ? {
              bloodPressure: validated.bloodPressure || undefined,
              temperature: validated.temperature || undefined,
            }
          : null,
      staffNotes: validated.staffNotes || null,
      status: validated.status as any,
    });

    return NextResponse.json({
      success: true,
      message: `Walk-in patient ${result.clientName} successfully registered in queue`,
      walkIn: result,
    });
  } catch (error: any) {
    console.error("POST Walk-in error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid walk-in data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to register walk-in patient" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
