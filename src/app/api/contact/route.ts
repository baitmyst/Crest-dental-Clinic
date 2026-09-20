import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/services/supabase";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Phone number is required"),
  email: z.string().email("Valid email address is required"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  privacyConsent: z.boolean().refine((val) => val === true, "Privacy policy consent is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = contactSchema.parse(body);

    const { data: supaInq, error: inqErr } = await supabaseAdmin
      .from("contact_inquiries")
      .insert({
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
        status: "OPEN",
      })
      .select("id")
      .single();

    if (inqErr || !supaInq) {
      console.error("Contact inquiry creation error:", inqErr);
      throw new Error("Failed to submit inquiry to database");
    }

    return NextResponse.json({
      success: true,
      id: supaInq.id,
      message:
        "Thank you for contacting Dr. Dental Crest Dental Surgery. Our team will review your inquiry and respond shortly.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send your message. Please call the clinic directly." },
      { status: 500 }
    );
  }
}
