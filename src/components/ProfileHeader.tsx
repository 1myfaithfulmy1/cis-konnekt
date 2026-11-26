"use client";

import Image from "next/image";
import { useState } from "react";
import { ru } from "@/content/ru";
import { resizeImageToBlob } from "@/lib/image";
import type { Profile } from "@/types";

function Avatar({ profile, size = 56 }: { profile: Profile; size?: number }) {
  const initial = profile.name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-border bg-surface"
      style={{ width: size, height: size }}
    >
      {profile.avatarUrl ? (
        <Image src={profile.avatarUrl} alt="" fill unoptimized className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-lg text-muted">
          {initial}
        </div>
      )}
    </div>
  );
}

export function ProfileHeader({
  profile,
  onUpdateProfile,
  onUpdateAvatar,
  onRemoveAvatar,
  onLogout,
}: {
  profile: Profile;
  onUpdateProfile: (name: string, nickname: string) => Promise<void>;
  onUpdateAvatar: (file: Blob) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
  onLogout: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [nickname, setNickname] = useState(profile.nickname ?? "");
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const displayName = profile.nickname ? `${profile.name} (${profile.nickname})` : profile.name;

  function openEdit() {
    setName(profile.name);
    setNickname(profile.nickname ?? "");
    setAvatarError(null);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdateProfile(name, nickname);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarError(null);
    setAvatarLoading(true);
    try {
      const blob = await resizeImageToBlob(file, 400, 0.85);
      await onUpdateAvatar(blob);
    } catch {
      setAvatarError(ru.profile.avatarError);
    } finally {
      setAvatarLoading(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarLoading(true);
    try {
      await onRemoveAvatar();
    } finally {
      setAvatarLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar profile={profile} />
          <p className="font-display text-lg text-foreground">{displayName}</p>
        </div>
        <button onClick={onLogout} className="min-h-[36px] shrink-0 text-sm text-muted underline">
          {ru.auth.logout}
        </button>
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar profile={profile} size={64} />
            <div className="flex flex-1 flex-wrap gap-2">
              <label className="flex min-h-[40px] cursor-pointer items-center justify-center rounded-xl border border-border px-3 text-sm text-foreground">
                {avatarLoading ? "Загружаю…" : profile.avatarUrl ? ru.profile.avatarReplace : ru.profile.avatarUpload}
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              {profile.avatarUrl ? (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  disabled={avatarLoading}
                  className="min-h-[40px] rounded-xl border border-border px-3 text-sm text-muted disabled:opacity-60"
                >
                  {ru.profile.avatarRemove}
                </button>
              ) : null}
            </div>
          </div>
          {avatarError ? <p className="text-xs text-red-400">{avatarError}</p> : null}

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">{ru.profile.nameLabel}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>

          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={ru.profile.nicknamePlaceholder}
            className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="min-h-[44px] flex-1 rounded-xl border border-border text-sm text-muted"
            >
              {ru.profile.editProfileCancel}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="min-h-[44px] flex-1 rounded-xl bg-accent text-sm font-medium text-accent-ink disabled:opacity-60"
            >
              {ru.profile.saveProfile}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={openEdit} className="mt-2 min-h-[36px] text-sm text-muted underline">
          {ru.profile.editProfile}
        </button>
      )}
    </div>
  );
}
