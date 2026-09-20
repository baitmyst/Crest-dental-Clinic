// ==============================================================================
// Crest Dental Clinic — Production End-to-End Verification Script
// Tests: Client Booking -> Supabase Persistence -> Double Booking Prevention ->
//        Staff Auth -> Status Update -> Client Status Verification -> RLS Security
// ==============================================================================

const { createAppointmentRequest, getAppointments, getAppointmentByReference, updateAppointment } = require("../src/services/appointments");
const { authenticateStaff } = require("../src/services/auth");
const { getAvailableSlotsForDate } = require("../src/services/availability");
const { supabaseAdmin, supabase } = require("../src/services/supabase");

async function runE2ETest() {
  console.log("================================================================");
  console.log("STARTING CREST DENTAL CLINIC END-TO-END INTEGRATION TEST");
  console.log("================================================================\n");

  const testDate = "2026-10-15"; // Future Thursday
  const testTime = "10:00";

  // 1. Check availability
  console.log("STEP 1: Testing Availability Calculation for " + testDate);
  const avail = await getAvailableSlotsForDate(testDate, "general-dentistry-checkups");
  console.log(`✓ Calculated ${avail.slots.length} total slots for ${testDate}. First slot: ${avail.slots[0]?.time} (${avail.slots[0]?.label})`);
  const slot10 = avail.slots.find(s => s.time === testTime);
  console.log(`✓ Slot ${testTime} availability status:`, slot10 ? (slot10.available ? "AVAILABLE" : "OCCUPIED") : "NOT_FOUND");

  // 2. Client Appointment Booking
  console.log("\nSTEP 2: Submitting Client Appointment Request to Supabase");
  const bookingInput = {
    fullName: "Kato Emmanuel",
    phone: "+256 701 998877",
    email: "kato.emmanuel@example.ug",
    serviceSlug: "general-dentistry-checkups",
    preferredDate: testDate,
    preferredTime: testTime,
    isReturningPatient: false,
    preferredCommunicationMethod: "phone",
    clientMessage: "E2E Test: Routine tooth examination requested.",
    privacyConsent: true,
  };

  const bookingResult = await createAppointmentRequest(bookingInput);
  console.log("✓ Supabase Appointment Created Successfully!");
  console.log("  - Database ID:", bookingResult.id);
  console.log("  - Reference Number:", bookingResult.referenceNumber);
  console.log("  - Status:", bookingResult.status);
  console.log("  - Cancellation Token:", bookingResult.cancellationToken ? "PRESENT" : "MISSING");

  if (bookingResult.status !== "PENDING") {
    throw new Error(`Expected status PENDING but got ${bookingResult.status}`);
  }

  // 3. Prevent Double Booking
  console.log("\nSTEP 3: Testing Double-Booking Prevention on Identical Slot (" + testDate + " at " + testTime + ")");
  try {
    await createAppointmentRequest({
      ...bookingInput,
      fullName: "Impostor Patient",
      email: "impostor@example.com",
    });
    throw new Error("FAIL: Double booking was NOT prevented!");
  } catch (err) {
    if (err.message.includes("just been requested or booked") || err.message.includes("already booked")) {
      console.log("✓ Double booking successfully prevented by backend! Error:", err.message);
    } else {
      throw err;
    }
  }

  // 4. Staff Authentication with Supabase Auth
  console.log("\nSTEP 4: Testing Staff Authentication via Supabase Auth");
  const authResult = await authenticateStaff("admin@crestdentalsurgery.com", "AdminPass2026!");
  if (!authResult.success || !authResult.session) {
    throw new Error("Staff authentication failed: " + authResult.error);
  }
  console.log("✓ Authenticated as:", authResult.session.email);
  console.log("  - Staff Role:", authResult.session.role);
  console.log("  - Name:", authResult.session.firstName, authResult.session.lastName);

  // 5. Staff Dashboard Appointment Verification
  console.log("\nSTEP 5: Verifying Appointment is Visible in Staff Dashboard");
  const allAppointments = await getAppointments({ status: "ALL" });
  const found = allAppointments.find(a => a.referenceNumber === bookingResult.referenceNumber);
  if (!found) {
    throw new Error("Created appointment not found in staff appointments query!");
  }
  console.log("✓ Appointment located in staff panel query:");
  console.log("  - Patient:", found.client.fullName, `(${found.client.phone})`);
  console.log("  - Service:", found.service.name);
  console.log("  - Slot:", found.preferredDate, "at", found.preferredTime);
  console.log("  - Status:", found.status);

  // 6. Staff Updates Appointment: PENDING -> CONFIRMED with Staff Notes
  console.log("\nSTEP 6: Staff Confirms Appointment & Adds Internal Notes");
  const updatedRecord = await updateAppointment(bookingResult.id, {
    status: "CONFIRMED",
    internalNote: "Called patient Kato via phone. Confirmed arrival 10 minutes prior to visit.",
  });
  console.log("✓ Supabase Record Updated Successfully:");
  console.log("  - New Database Status:", updatedRecord.status);
  console.log("  - Internal Note:", updatedRecord.internal_note);

  // 7. Two-Way Sync: Client Live Status Lookup
  console.log("\nSTEP 7: Client Queries Real-Time Status using Reference Number");
  const clientView = await getAppointmentByReference(bookingResult.referenceNumber);
  if (!clientView) {
    throw new Error("Client status lookup failed to locate appointment!");
  }
  console.log("✓ Client View Confirmed:");
  console.log("  - Reference:", clientView.referenceNumber);
  console.log("  - Client-Facing Status:", clientView.status);
  console.log("  - Service:", clientView.serviceName);

  if (clientView.status !== "CONFIRMED") {
    throw new Error(`Expected client status CONFIRMED after staff action, got ${clientView.status}`);
  }

  // 8. Security & RLS Verification
  console.log("\nSTEP 8: Verifying Row Level Security (RLS) Isolation");
  const { data: anonData, error: anonErr } = await supabase
    .from("appointment_requests")
    .select("*");
  console.log("✓ Anonymous Public Query to appointment_requests returned rows:", (anonData || []).length);
  if ((anonData || []).length > 0) {
    throw new Error("RLS LEAK: Anonymous public client was able to query private appointments!");
  }
  console.log("✓ RLS successfully protected private appointments from public read!");

  // Clean up test appointment
  console.log("\nSTEP 9: Cleaning up test appointment record from database");
  await supabaseAdmin.from("appointment_requests").delete().eq("id", bookingResult.id);
  console.log("✓ Test record cleaned up.");

  console.log("\n================================================================");
  console.log("ALL END-TO-END TESTS PASSED WITH 100% SUPABASE INTEGRATION!");
  console.log("================================================================\n");
}

runE2ETest().catch((err) => {
  console.error("\n❌ E2E TEST FAILED:", err);
  process.exit(1);
});
