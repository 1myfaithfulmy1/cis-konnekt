"use client";

import { useRouter } from "next/navigation";
import { ClientOnly } from "@/components/ClientOnly";
import { CabinetSkeleton } from "@/components/CabinetSkeleton";
import { EventForm } from "@/components/cabinet/EventForm";
import { useAppState } from "@/hooks/useAppState";
import { upsertLocalEvent } from "@/lib/storage";
import type { CisEvent } from "@/types";

export default function NewEventPage() {
  return (
    <ClientOnly fallback={<CabinetSkeleton />}>
      <NewEventContent />
    </ClientOnly>
  );
}

function NewEventContent() {
  const router = useRouter();
  const { state, update } = useAppState();

  // Создавать событие можно только от имени выбранного в кабинете организатора.
  if (!state.selectedOrganizerId) {
    router.replace("/cabinet");
    return null;
  }

  function handleSave(event: CisEvent) {
    update((prev) => upsertLocalEvent(prev, event));
    router.push("/cabinet");
  }

  return (
    <EventForm
      organizerId={state.selectedOrganizerId}
      onSave={handleSave}
      onCancel={() => router.push("/cabinet")}
    />
  );
}
