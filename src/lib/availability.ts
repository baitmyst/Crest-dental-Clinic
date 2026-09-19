import { prisma } from "./prisma";
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
  const workingHours = await prisma.workingHours.findFirst({
    where: {
      dayOfWeek,
      dentistId: dentistId || null,
    },
  });

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
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (service) {
      durationMinutes = service.durationMinutes;
      bufferMinutes = service.bufferMinutes;
    }
  }

  const slotInterval = durationMinutes + bufferMinutes; // e.g. 60 mins

  // Parse start and end hours
  const [startH, startM] = workingHours.startTime.split(":").map(Number);
  const [endH, endM] = workingHours.endTime.split(":").map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  // Fetch confirmed / existing appointments for that date
  const existingAppointments = await prisma.appointmentRequest.findMany({
    where: {
      preferredDate: dateString,
      status: {
        in: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS, AppointmentStatus.CHECKED_IN],
      },
    },
  });

  const bookedTimes = new Set(existingAppointments.map((a) => a.preferredTime));

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
