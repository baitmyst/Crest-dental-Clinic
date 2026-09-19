import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateReferenceNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `DDC-${currentYear}-${randomPart}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-UG", {
      timeZone: "Africa/Kampala",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
