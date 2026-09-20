import { supabaseAdmin } from "./supabase";

export interface AvailableSlot {
  time: string; // "09:00"
  label: string; // "9:00 AM"
  available: boolean;
  reason?: string;
}

/**
 * Calculates available appointment slots for a given date and service.
 * Connects directly to Supabase `working_hours`, `services`, and `appointment_requests`.
 */
export async function getAvailableSlotsForDate(
  dateString: string, // YYYY-MM-DD
  serviceSlug?: string,
  dentistId?: string
): Promise<{ date: string; slots: AvailableSlot[]; notice?: string }> {
  const targetDate = new Date(`${dateString}T00:00:00`);
  if (isNaN(targetDate.getTime())) {
    return { date: dateString, slots: [], notice: "Invalid date provided" };
  }

  // Day of week: 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const dayOfWeek = targetDate.getDay();

  // 1. Fetch working hours from Supabase
  let workingHours: {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    isVerified: boolean;
  } | null = null;

  try {
    let query = supabaseAdmin
      .from("working_hours")
      .select("start_time, end_time, is_available, is_verified")
      .eq("day_of_week", dayOfWeek);

    if (dentistId) {
      query = query.eq("dentist_id", dentistId);
    }

    const { data: supaWh } = await query.maybeSingle();

    if (supaWh) {
      workingHours = {
        startTime: supaWh.start_time,
        endTime: supaWh.end_time,
        isAvailable: supaWh.is_available,
        isVerified: supaWh.is_verified,
      };
    }
  } catch (err) {
    console.warn("Supabase workingHours error:", err);
  }

  // Fallback defaults if table is empty or unverified
  if (!workingHours || !workingHours.isVerified) {
    if (dayOfWeek === 0) {
      workingHours = { startTime: "09:00", endTime: "17:00", isAvailable: true, isVerified: true };
    } else {
      // Monday through Saturday (including Friday) are normal working hours: 8:00 AM – 8:00 PM
      workingHours = { startTime: "08:00", endTime: "20:00", isAvailable: true, isVerified: true };
    }
  }

  if (!workingHours.isAvailable) {
    return {
      date: dateString,
      slots: [],
      notice: "The clinic is not accepting online bookings on this date.",
    };
  }

  // 3. Fetch service duration from Supabase
  let durationMinutes = 45;
  let bufferMinutes = 15;

  if (serviceSlug) {
    try {
      const { data: supaSvc } = await supabaseAdmin
        .from("services")
        .select("duration_minutes, buffer_minutes")
        .or(`slug.eq.${serviceSlug},id.eq.${serviceSlug}`)
        .maybeSingle();

      if (supaSvc) {
        durationMinutes = supaSvc.duration_minutes || 45;
        bufferMinutes = supaSvc.buffer_minutes || 15;
      }
    } catch {
      // Safe defaults
    }
  }

  const slotInterval = durationMinutes + bufferMinutes; // e.g. 60 mins

  // 4. Fetch existing booked appointments for that date
  const bookedTimes = new Set<string>();
  try {
    const { data: bookedAppts } = await supabaseAdmin
      .from("appointment_requests")
      .select("preferred_time")
      .eq("preferred_date", dateString)
      .in("status", ["PENDING", "CONFIRMED", "IN_PROGRESS"]);

    if (bookedAppts) {
      bookedAppts.forEach((a: any) => {
        if (a.preferred_time) bookedTimes.add(a.preferred_time);
      });
    }
  } catch (err) {
    console.warn("Error fetching booked appointments:", err);
  }

  // 5. Compute slots within working hours
  const [startH, startM] = workingHours.startTime.split(":").map(Number);
  const [endH, endM] = workingHours.endTime.split(":").map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  const slots: AvailableSlot[] = [];

  for (let m = startTotalMinutes; m + durationMinutes <= endTotalMinutes; m += slotInterval) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h >= 12 ? "PM" : "AM";
    const label = `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;

    const isBooked = bookedTimes.has(timeStr);

    slots.push({
      time: timeStr,
      label,
      available: !isBooked,
      reason: isBooked ? "Booked" : undefined,
    });
  }

  return {
    date: dateString,
    slots,
  };
}
