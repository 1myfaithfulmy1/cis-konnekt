"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ru } from "@/content/ru";
import { GENRE_OPTIONS } from "@/data/genres";
import { DISTRICTS } from "@/data/districts";
import { resizeImageToBlob } from "@/lib/image";
import { uploadEventCover, deleteEventCover } from "@/lib/supabase/eventCover";
import type { CisEvent, Genre } from "@/types";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="block text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "min-h-[44px] w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent";

export function EventForm({
  organizerId,
  initial,
  onSave,
  onCancel,
}: {
  organizerId: string;
  initial?: CisEvent;
  onSave: (event: CisEvent) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [metro, setMetro] = useState(initial?.metro ?? "");
  const [district, setDistrict] = useState(initial?.district ?? DISTRICTS[0]);
  const [genre, setGenre] = useState<Genre>(initial?.genre ?? GENRE_OPTIONS[0].value);
  const [dayOffset, setDayOffset] = useState(String(initial?.dayOffset ?? 1));
  const [startTime, setStartTime] = useState(initial?.startTime ?? "22:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "02:00");
  const [lineup, setLineup] = useState(initial?.lineup.join(", ") ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [vibe, setVibe] = useState(initial?.vibe.join(", ") ?? "");
  const [faceControl, setFaceControl] = useState(initial?.faceControl ?? false);
  const [dressCode, setDressCode] = useState(initial?.dressCode ?? "Свободный");
  const [age18Plus, setAge18Plus] = useState(initial?.age18Plus ?? true);
  const [price, setPrice] = useState(String(initial?.price ?? 0));
  const [ticketUrl, setTicketUrl] = useState(initial?.ticketUrl ?? "");
  const [isPrivate, setIsPrivate] = useState(initial?.isPrivate ?? false);
  const [accessCode, setAccessCode] = useState(initial?.accessCode ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(initial?.coverImageUrl);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  // Стабильный id — нужен сразу, чтобы фото можно было загрузить в Storage
  // ещё до первого сохранения нового события.
  const [eventId] = useState(() => initial?.id ?? `custom-${crypto.randomUUID()}`);

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // чтобы можно было выбрать тот же файл повторно
    if (!file) return;

    setImageError(null);
    setImageLoading(true);
    try {
      const blob = await resizeImageToBlob(file);
      const url = await uploadEventCover(organizerId, eventId, blob);
      setCoverImageUrl(url);
    } catch {
      setImageError("Не получилось загрузить это фото — попробуй другое");
    } finally {
      setImageLoading(false);
    }
  }

  async function handleRemovePhoto() {
    setImageError(null);
    setImageLoading(true);
    try {
      await deleteEventCover(organizerId, eventId);
      setCoverImageUrl(undefined);
    } catch {
      setImageError("Не получилось убрать фото — попробуй ещё раз");
    } finally {
      setImageLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = ru.cabinet.formRequired;
    if (!venue.trim()) nextErrors.venue = ru.cabinet.formRequired;
    if (!address.trim()) nextErrors.address = ru.cabinet.formRequired;
    if (!metro.trim()) nextErrors.metro = ru.cabinet.formRequired;
    if (!startTime) nextErrors.startTime = ru.cabinet.formRequired;
    if (!endTime) nextErrors.endTime = ru.cabinet.formRequired;
    if (!ticketUrl.trim()) nextErrors.ticketUrl = ru.cabinet.formRequired;
    if (isPrivate && !accessCode.trim()) nextErrors.accessCode = ru.cabinet.formRequired;
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) nextErrors.price = ru.cabinet.formInvalidPrice;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const event: CisEvent = {
      id: eventId,
      title: title.trim(),
      organizerId,
      venue: venue.trim(),
      address: address.trim(),
      metro: metro.trim(),
      district,
      dayOffset: Number(dayOffset) || 0,
      startTime,
      endTime,
      genre,
      lineup: lineup.split(",").map((s) => s.trim()).filter(Boolean),
      description: description.trim(),
      vibe: vibe.split(",").map((s) => s.trim()).filter(Boolean),
      faceControl,
      dressCode: dressCode.trim(),
      age18Plus,
      price: priceNum,
      ticketUrl: ticketUrl.trim(),
      isPrivate,
      accessCode: isPrivate ? accessCode.trim() : undefined,
      friendsGoingIds: initial?.friendsGoingIds ?? [],
      coverImageUrl,
      viewCount: initial?.viewCount ?? 0,
    };

    onSave(event);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 px-4 pb-10 pt-4 md:mx-auto md:max-w-2xl md:px-6 md:py-6"
    >
      <h1 className="font-display text-xl text-foreground">
        {initial ? ru.cabinet.formTitleEdit : ru.cabinet.formTitleNew}
      </h1>

      <Field label={ru.cabinet.fieldTitle} error={errors.title}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>

      <div className="space-y-1.5">
        <span className="text-sm font-medium text-foreground">{ru.cabinet.fieldCoverImage}</span>

        {coverImageUrl ? (
          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border border-border">
            <Image src={coverImageUrl} alt="" fill unoptimized className="object-cover" />
          </div>
        ) : null}

        <div className="flex gap-2">
          <label className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-xl border border-border text-sm text-foreground">
            {imageLoading ? "Загружаю…" : coverImageUrl ? "Заменить фото" : "Загрузить фото"}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          {coverImageUrl ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={imageLoading}
              className="min-h-[44px] rounded-xl border border-border px-4 text-sm text-muted disabled:opacity-60"
            >
              {ru.cabinet.removePhoto}
            </button>
          ) : null}
        </div>

        {imageError ? <p className="text-xs text-red-400">{imageError}</p> : null}
        <p className="text-xs text-muted">{ru.cabinet.coverImageHint}</p>
      </div>

      <Field label={ru.cabinet.fieldVenue} error={errors.venue}>
        <input value={venue} onChange={(e) => setVenue(e.target.value)} className={inputClass} />
      </Field>

      <Field label={ru.cabinet.fieldAddress} error={errors.address}>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
      </Field>

      <Field label={ru.cabinet.fieldMetro} error={errors.metro}>
        <input value={metro} onChange={(e) => setMetro(e.target.value)} className={inputClass} />
      </Field>

      <Field label={ru.cabinet.fieldDistrict}>
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className={inputClass}>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>

      <Field label={ru.cabinet.fieldGenre}>
        <select value={genre} onChange={(e) => setGenre(e.target.value as Genre)} className={inputClass}>
          {GENRE_OPTIONS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={ru.cabinet.fieldDayOffset}>
        <input
          type="number"
          min={0}
          value={dayOffset}
          onChange={(e) => setDayOffset(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={ru.cabinet.fieldStartTime} error={errors.startTime}>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={ru.cabinet.fieldEndTime} error={errors.endTime}>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={ru.cabinet.fieldLineup}>
        <input value={lineup} onChange={(e) => setLineup(e.target.value)} className={inputClass} />
      </Field>

      <Field label={ru.cabinet.fieldDescription}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputClass} min-h-[88px] py-2.5`}
        />
      </Field>

      <Field label={ru.cabinet.fieldVibe}>
        <input value={vibe} onChange={(e) => setVibe(e.target.value)} className={inputClass} />
      </Field>

      <Field label={ru.cabinet.fieldDressCode}>
        <input value={dressCode} onChange={(e) => setDressCode(e.target.value)} className={inputClass} />
      </Field>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{ru.cabinet.fieldFaceControl}</span>
        <input
          type="checkbox"
          checked={faceControl}
          onChange={(e) => setFaceControl(e.target.checked)}
          className="h-5 w-5 accent-accent"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{ru.cabinet.fieldAge18Plus}</span>
        <input
          type="checkbox"
          checked={age18Plus}
          onChange={(e) => setAge18Plus(e.target.checked)}
          className="h-5 w-5 accent-accent"
        />
      </div>

      <Field label={ru.cabinet.fieldPrice} error={errors.price}>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={ru.cabinet.fieldTicketUrl} error={errors.ticketUrl}>
        <input
          value={ticketUrl}
          onChange={(e) => setTicketUrl(e.target.value)}
          placeholder="https://example.com/tickets/..."
          className={inputClass}
        />
      </Field>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{ru.cabinet.fieldIsPrivate}</span>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-5 w-5 accent-accent"
        />
      </div>

      {isPrivate ? (
        <Field label={ru.cabinet.fieldAccessCode} error={errors.accessCode}>
          <input
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className={inputClass}
          />
        </Field>
      ) : null}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] flex-1 rounded-xl border border-border text-sm text-muted"
        >
          {ru.cabinet.formCancel}
        </button>
        <button
          type="submit"
          className="min-h-[48px] flex-1 rounded-xl bg-accent text-sm font-medium text-accent-ink"
        >
          {ru.cabinet.formSave}
        </button>
      </div>
    </form>
  );
}
