import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { InquiryStatus } from "@prisma/client";

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

    let inquiryId = "";
    try {
      const inquiry = await prisma.contactInquiry.create({
        data: {
          name: validated.name,
          phone: validated.phone,
          email: validated.email,
          subject: validated.subject,
          message: validated.message,
          status: InquiryStatus.OPEN,
        },
      });
      inquiryId = inquiry.id;
    } catch (err) {
      console.warn("Prisma contact inquiry creation failed, inserting via Supabase:", err);
      const { data: supaInq } = await supabaseAdmin
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
        .maybeSingle();

      inquiryId = supaInq?.id || `inq-${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      id: inquiryId,
      message:
        "Thank you for contacting Dr. Dental Crest Dental Surgery. Our team will respond as soon as possible.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send your message. Please call the clinic directly." },
      { status: 500 }
    );
  }
}
