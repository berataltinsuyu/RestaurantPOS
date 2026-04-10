import { getSupabaseClient, isSupabaseConfigured } from "../supabase/client";
import { RealtimeTopic } from "../../types/supabase";

type RealtimeHandler = (topic: RealtimeTopic) => void;
interface RealtimeSubscribeOptions {
  channelId?: string;
  filter?: string;
}

const TOPIC_TO_TABLE: Record<RealtimeTopic, string> = {
  bills: "Bills",
  payments: "Payments",
  restaurantTables: "RestaurantTables",
};

export class RealtimeService {
  public readonly isConfigured = isSupabaseConfigured();

  subscribe(
    topic: RealtimeTopic,
    handler: RealtimeHandler,
    options?: RealtimeSubscribeOptions,
  ) {
    const client = getSupabaseClient();

    if (!client) {
      return () => undefined;
    }

    const channelName = options?.channelId
      ? `mobile:${topic}:${options.channelId}`
      : `mobile:${topic}:${Date.now()}`;
    const channel = client
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          filter: options?.filter,
          schema: "public",
          table: TOPIC_TO_TABLE[topic],
        },
        () => handler(topic),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }
}
