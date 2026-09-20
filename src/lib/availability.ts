import { prisma } from "./prisma";
import { supabaseAdmin } from "./supabase";
import { AppointmentStatus } from "@prisma/client";

export interface AvailableSlot {
  time: string; // "09:00"
  label: string; // "9:00 AM"
  available: boolean;
  reason?: string;
}

export async function getAvailableSlotsForDate(
  dateString: string, // "YYYY-MM-DD"
  serviceId?: string,
  dentistId?: string
): Promise<{ date: string; slots: AvailableSlot[]; notice?: string }> {
  // Parse date
  const targetDate = new Date(`${dateString}T00:00:00`);
  if (isNaN(targetDate.getTime())) {
    return { date: dateString, slots: [], notice: "Invalid date provided" };
  }

  // Determine day of week: 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const dayOfWeek = targetDate.getDay();

  // Fetch working hours for this day of week
  let workingHours: {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    isVerified: boolean;
  } | null = null;

  try {
    const wh = await prisma.workingHours.findFirst({
      where: {
        dayOfWeek,
        dentistId: dentistId || null,
      },
    });
    if (wh) {
      workingHours = {
        startTime: wh.startTime,
        endTime: wh.endTime,
        isAvailable: wh.isAvailable,
        isVerified: wh.isVerified,
      };
    }
  } catch (err) {
    console.warn("Prisma workingHours error, querying Supabase client:", err);
  }

  if (!workingHours) {
    try {
      const { data: supaWh, error } = await supabaseAdmin
        .from("working_hours")
        .select("*")
        .eq("day_of_week", dayOfWeek)
        .maybeSingle();

      if (supaWh && !error) {
        workingHours = {
          startTime: supaWh.start_time,
          endTime: supaWh.end_time,
          isAvailable: supaWh.is_available,
          isVerified: supaWh.is_verified,
        };
      }
    } catch (supaErr) {
      console.warn("Supabase workingHours error:", supaErr);
    }
  }

  // Fallback defaults if database tables cannot be reached
  if (!workingHours) {
    if (dayOfWeek === 5) {
      workingHours = { startTime: "08:00", endTime: "08:30", isAvailable: false, isVerified: false };
    } else if (dayOfWeek === 0) {
      workingHours = { startTime: "09:00", endTime: "17:00", isAvailable: true, isVerified: true };
    } else {
      workingHours = { startTime: "08:00", endTime: "20:00", isAvailable: true, isVerified: true };
    }
  }

  // Strict Friday rule: If hours are unverified or day is not available, block booking
  if (!workingHours || !workingHours.isAvailable || !workingHours.isVerified) {
    if (dayOfWeek === 5) {
      return {
        date: dateString,
        slots: [],
        notice: "Friday clinic hours are currently under administrative confirmation. Please call our clinic at +256 773 003214 for Friday appointments.",
      };
    }
    return {
      date: dateString,
      slots: [],
      notice: "The clinic is not available for online appointment requests on this date.",
    };
  }

  // Get service duration
  let durationMinutes = 45;
  let bufferMinutes = 15;
  if (serviceId) {
    try {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (service) {
        durationMinutes = service.durationMinutes;
        bufferMinutes = service.bufferMinutes;
      }
    } catch {
      try {
        const { data: supaSvc } = await supabaseAdmin
          .from("services")
          .select("duration_minutes, buffer_minutes")
          .or(`id.eq.${serviceId},slug.eq.${serviceId}`)
          .maybeSingle();
        if (supaSvc) {
          durationMinutes = supaSvc.duration_minutes || 45;
          bufferMinutes = supaSvc.buffer_minutes || 15;
        }
      } catch {
        // Fallback default duration
      }
    }
  }

  const slotInterval = durationMinutes + bufferMinutes; // e.g. 60 mins

  // Parse start and end hours
  const [startH, startM] = workingHours.startTime.split(":").map(Number);
  const [endH, endM] = workingHours.endTime.split(":").map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  // Fetch confirmed / existing appointments for that date
  const bookedTimes = new Set<string>();
  try {
    const existingAppointments = await prisma.appointmentRequest.findMany({
      where: {
        preferredDate: dateString,
        status: {
          in: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS, AppointmentStatus.CHECKED_IN],
        },
      },
    });
    existingAppointments.forEach((a) => bookedTimes.add(a.preferredTime));
  } catch {
    try {
      const { data: supaAppts } = await supabaseAdmin
        .from("appointment_requests")
        .select("preferred_time")
        .eq("preferred_date", dateString)
        .in("status", ["CONFIRMED", "IN_PROGRESS", "CHECKED_IN"]);
      if (supaAppts) {
        supaAppts.forEach((a: any) => bookedTimes.add(a.preferred_time));
      }
    } catch {
      // Safe empty set
    }
  }

  const slots: AvailableSlot[] = [];
  for (let m = startTotalMinutes; m + durationMinutes <= endTotalMinutes; m += slotInterval) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

    // Format human readable label (e.g. 8:00 AM)
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
