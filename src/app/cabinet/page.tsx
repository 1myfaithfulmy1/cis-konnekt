"use client";

import { ClientOnly } from "@/components/ClientOnly";
import { CabinetSkeleton } from "@/components/CabinetSkeleton";
import { AuthForm } from "@/components/AuthForm";
import { CreateOrganizerForm } from "@/components/cabinet/CreateOrganizerForm";
import { OrganizerDashboard } from "@/components/cabinet/OrganizerDashboard";
import { useSession } from "@/hooks/useSession";
import { useMyOrganizer } from "@/hooks/useMyOrganizer";

export default function CabinetPage() {
  return (
    <ClientOnly fallback={<CabinetSkeleton />}>
      <CabinetContent />
    </ClientOnly>
  );
}

function CabinetContent() {
  const { user, loading: sessionLoading } = useSession();

  if (sessionLoading) return <CabinetSkeleton />;
  if (!user) {
    return (
      <div className="px-4 pt-6 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
        <AuthForm />
      </div>
    );
  }

  return <MyOrganizerCabinet userId={user.id} />;
}

function MyOrganizerCabinet({ userId }: { userId: string }) {
  const { organizer, loading, createOrganizer } = useMyOrganizer(userId);

  if (loading) return <CabinetSkeleton />;
  if (!organizer) return <CreateOrganizerForm onCreate={createOrganizer} />;

  return <OrganizerDashboard organizer={organizer} />;
}
