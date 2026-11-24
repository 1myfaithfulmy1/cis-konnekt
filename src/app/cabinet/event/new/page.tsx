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

export default function NewEventPage() {
  return (
    <ClientOnly fallback={<CabinetSkeleton />}>
      <NewEventContent />
    </ClientOnly>
  );
}

function NewEventContent() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { organizer, loading: organizerLoading } = useMyOrganizer(
    sessionLoading ? undefined : (user?.id ?? null)
  );
  const { saveEvent } = useOrganizerEvents(organizerLoading ? undefined : (organizer?.id ?? null));

  const ready = !sessionLoading && !organizerLoading;

  // Создавать событие можно только от имени своего организатора.
  useEffect(() => {
    if (ready && !organizer) router.replace("/cabinet");
  }, [ready, organizer, router]);

  if (!ready || !organizer) return <CabinetSkeleton />;

  async function handleSave(event: CisEvent) {
    await saveEvent(event);
    router.push("/cabinet");
  }

  return (
    <EventForm organizerId={organizer.id} onSave={handleSave} onCancel={() => router.push("/cabinet")} />
  );
}
