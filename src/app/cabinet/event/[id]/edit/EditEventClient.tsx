"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientOnly } from "@/components/ClientOnly";
import { CabinetSkeleton } from "@/components/CabinetSkeleton";
import { EventForm } from "@/components/cabinet/EventForm";
import { useSession } from "@/hooks/useSession";
import { useMyOrganizer } from "@/hooks/useMyOrganizer";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
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
  const { user, loading: sessionLoading } = useSession();
  const { organizer, loading: organizerLoading } = useMyOrganizer(
    sessionLoading ? undefined : (user?.id ?? null)
  );
  const { events, loading: eventsLoading, saveEvent } = useOrganizerEvents(
    organizerLoading ? undefined : (organizer?.id ?? null)
  );
  const event = events.find((e) => e.id === id);

  const organizerReady = !sessionLoading && !organizerLoading;

  // Редактировать можно только от имени своего организатора.
  useEffect(() => {
    if (organizerReady && !organizer) router.replace("/cabinet");
  }, [organizerReady, organizer, router]);

  if (!organizerReady || !organizer) return <CabinetSkeleton />;
  if (eventsLoading) return <CabinetSkeleton />;

  // Редактировать можно только своё событие — чужое или несуществующее тут не покажем.
  if (!event) {
    return (
      <div className="px-4 pt-10 text-center md:mx-auto md:max-w-2xl md:px-6 md:py-10">
        <p className="text-sm text-muted">Событие не найдено или принадлежит другому организатору</p>
      </div>
    );
  }

  async function handleSave(updated: CisEvent) {
    await saveEvent(updated);
    router.push("/cabinet");
  }

  return (
    <EventForm organizerId={organizer.id} initial={event} onSave={handleSave} onCancel={() => router.push("/cabinet")} />
  );
}
