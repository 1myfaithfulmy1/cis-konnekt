"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapMessageRow, type MessageRow } from "@/lib/supabase/mappers";
import type { Message } from "@/types";

/** Переписка с одним конкретным собеседником — с живым обновлением без перезагрузки. */
export function useMessages(userId: string | null, otherId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async (): Promise<Message[]> => {
    if (!userId || !otherId) return [];
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });
    return (data ?? []).map(mapMessageRow);
  }, [userId, otherId]);

  useEffect(() => {
    fetchMessages().then(setMessages).finally(() => setLoading(false));
  }, [fetchMessages]);

  useEffect(() => {
    if (!userId || !otherId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`thread-${userId}-${otherId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as MessageRow;
          const belongsToThisThread =
            (row.sender_id === userId && row.recipient_id === otherId) ||
            (row.sender_id === otherId && row.recipient_id === userId);
          if (!belongsToThisThread) return;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, mapMessageRow(row)]));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, otherId]);

  async function sendMessage(body: string) {
    if (!userId || !otherId || !body.trim()) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .insert({ sender_id: userId, recipient_id: otherId, body: body.trim() })
      .select()
      .single();
    if (data) {
      const msg = mapMessageRow(data);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    }
  }

  return { messages, loading, sendMessage };
}
