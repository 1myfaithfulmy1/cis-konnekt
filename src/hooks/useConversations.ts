"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapMessageRow, mapPublicProfileRow } from "@/lib/supabase/mappers";
import type { Message, PublicProfile } from "@/types";

export interface Conversation {
  partner: PublicProfile;
  lastMessage: Message;
}

/** Список переписок — один собеседник, одно (последнее) сообщение с ним. */
export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async (): Promise<Conversation[]> => {
    if (!userId) return [];
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    const messages = (data ?? []).map(mapMessageRow);
    const seenPartners = new Set<string>();
    const lastMessages: Message[] = [];
    for (const m of messages) {
      const partnerId = m.senderId === userId ? m.recipientId : m.senderId;
      if (seenPartners.has(partnerId)) continue;
      seenPartners.add(partnerId);
      lastMessages.push(m);
    }
    if (lastMessages.length === 0) return [];

    const partnerIds = lastMessages.map((m) => (m.senderId === userId ? m.recipientId : m.senderId));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, nickname, avatar_url")
      .in("id", partnerIds);

    const profileById = new Map((profiles ?? []).map((p) => [p.id, mapPublicProfileRow(p)]));

    return lastMessages
      .map((m) => {
        const partnerId = m.senderId === userId ? m.recipientId : m.senderId;
        const partner = profileById.get(partnerId);
        return partner ? { partner, lastMessage: m } : null;
      })
      .filter((c): c is Conversation => c !== null);
  }, [userId]);

  useEffect(() => {
    fetchConversations().then(setConversations).finally(() => setLoading(false));
  }, [fetchConversations]);

  // Обновляем список при любом новом сообщении — без реалтайма тут список
  // переписок показывал бы вчерашнее, пока страницу не перезагрузишь.
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`conversations-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchConversations().then(setConversations);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchConversations]);

  return { conversations, loading };
}
