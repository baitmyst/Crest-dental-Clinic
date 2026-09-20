import { getWalkIns } from "@/services/walk-ins";
import { getActiveServices } from "@/services/services";
import { getDentists } from "@/services/staff";
import WalkInManager from "./WalkInManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Walk-in Patients & Reception Desk | Dr. Dental Crest",
  description: "Register and manage clinic walk-in patients arriving without appointment bookings.",
};

export default async function AdminWalkInsPage() {
  const [walkIns, services, dentists] = await Promise.all([
    getWalkIns(),
    getActiveServices(),
    getDentists(),
  ]);

  return (
    <WalkInManager
      initialWalkIns={walkIns}
      services={services}
      dentists={dentists}
    />
  );
}
