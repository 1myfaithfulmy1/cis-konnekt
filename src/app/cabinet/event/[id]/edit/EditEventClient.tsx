"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ClientOnly } from "@/components/ClientOnly";
import { CabinetSkeleton } from "@/components/CabinetSkeleton";
import { EventForm } from "@/components/cabinet/EventForm";
import { useAppState } from "@/hooks/useAppState";
import { getAllEvents } from "@/lib/events";
import { upsertLocalEvent } from "@/lib/storage";
import type { CisEvent } from "@/types";

export function EditEventClient({ id }: { id: string }) {
  return (
    <ClientOnly fallback={<CabinetSkeleton />}>
      <EditEventContent id={id} />
    </ClientOnly>
  );
}

function EditEventContent({ id }: { id: string }) {
  const router = useRouter();
  const { state, update } = useAppState();
  const event = useMemo(() => getAllEvents(state).find((e) => e.id === id), [state, id]);

  if (!state.selectedOrganizerId) {
    router.replace("/cabinet");
    return null;
  }

  // Редактировать можно только своё событие — чужое (другого организатора)
  // или несуществующее тут не покажем.
  if (!event || event.organizerId !== state.selectedOrganizerId) {
    return (
      <div className="px-4 pt-10 text-center md:mx-auto md:max-w-2xl md:px-6 md:py-10">
        <p className="text-sm text-muted">Событие не найдено или принадлежит другому организатору</p>
      </div>
    );
  }

  function handleSave(updated: CisEvent) {
    update((prev) => upsertLocalEvent(prev, updated));
    router.push("/cabinet");
  }

  return (
    <EventForm
      organizerId={state.selectedOrganizerId}
      initial={event}
      onSave={handleSave}
      onCancel={() => router.push("/cabinet")}
    />
  );
}
