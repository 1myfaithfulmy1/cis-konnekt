"use client";

import { ClientOnly } from "@/components/ClientOnly";
import { CabinetSkeleton } from "@/components/CabinetSkeleton";
import { OrganizerPicker } from "@/components/cabinet/OrganizerPicker";
import { OrganizerDashboard } from "@/components/cabinet/OrganizerDashboard";
import { useAppState } from "@/hooks/useAppState";
import { selectOrganizer } from "@/lib/storage";

export default function CabinetPage() {
  return (
    <ClientOnly fallback={<CabinetSkeleton />}>
      <CabinetContent />
    </ClientOnly>
  );
}

function CabinetContent() {
  const { state, update } = useAppState();

  if (!state.selectedOrganizerId) {
    return (
      <OrganizerPicker onSelect={(organizerId) => update((prev) => selectOrganizer(prev, organizerId))} />
    );
  }

  return (
    <OrganizerDashboard
      organizerId={state.selectedOrganizerId}
      state={state}
      update={update}
      onSwitch={() => update((prev) => selectOrganizer(prev, null))}
    />
  );
}
