import { RealtimeChannel } from "@supabase/supabase-js";

import { getSupabaseClient, isSupabaseConfigured } from "../supabase/client";
import { RealtimeTopic } from "../../types/supabase";

type RealtimeHandler = (topic: RealtimeTopic) => void;
interface RealtimeSubscribeOptions {
  channelId?: string;
  filter?: string;
}

interface ChannelRegistryEntry {
  channel: RealtimeChannel;
  channelName: string;
  handlers: Set<RealtimeHandler>;
  topic: RealtimeTopic;
}

const TOPIC_TO_TABLE: Record<RealtimeTopic, string> = {
  bills: "Bills",
  payments: "Payments",
  restaurantTables: "RestaurantTables",
};

let channelCounter = 0;

function normalizeChannelSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "_");
}

export class RealtimeService {
  private readonly channelRegistry = new Map<string, ChannelRegistryEntry>();

  public get isConfigured() {
    return isSupabaseConfigured();
  }

  subscribe(
    topic: RealtimeTopic,
    handler: RealtimeHandler,
    options?: RealtimeSubscribeOptions,
  ) {
    const client = getSupabaseClient();

    if (!client) {
      return () => undefined;
    }

    const baseChannelName = options?.channelId
      ? `mobile:${topic}:${options.channelId}`
      : `mobile:${topic}:${Date.now()}-${channelCounter += 1}`;
    const filterKey = normalizeChannelSegment(options?.filter ?? "all");
    const registryKey = `${baseChannelName}:${filterKey}`;
    const existingEntry = this.channelRegistry.get(registryKey);

    if (existingEntry) {
      console.info("[Realtime] Reusing existing channel.", {
        channelName: existingEntry.channelName,
        filter: options?.filter ?? null,
        topic,
      });
      existingEntry.handlers.add(handler);
      return this.createCleanup(client, registryKey, handler);
    }

    const channelName = `${registryKey}:${channelCounter += 1}`;

    console.info("[Realtime] Creating channel.", {
      channelName,
      filter: options?.filter ?? null,
      topic,
    });

    const handlers = new Set<RealtimeHandler>([handler]);
    const channel = client.channel(channelName);

    console.info("[Realtime] Attaching postgres_changes handler.", {
      channelName,
      filter: options?.filter ?? null,
      topic,
    });

    channel.on(
      "postgres_changes",
      {
        event: "*",
        filter: options?.filter,
        schema: "public",
        table: TOPIC_TO_TABLE[topic],
      },
      () => {
        const entry = this.channelRegistry.get(registryKey);

        if (!entry) {
          return;
        }

        entry.handlers.forEach((registeredHandler) => {
          registeredHandler(topic);
        });
      },
    );

    console.info("[Realtime] Calling subscribe().", {
      channelName,
      filter: options?.filter ?? null,
      topic,
    });
    channel.subscribe();

    this.channelRegistry.set(registryKey, {
      channel,
      channelName,
      handlers,
      topic,
    });

    return this.createCleanup(client, registryKey, handler);
  }

  private createCleanup(
    client: NonNullable<ReturnType<typeof getSupabaseClient>>,
    registryKey: string,
    handler: RealtimeHandler,
  ) {
    let isCleanedUp = false;

    return () => {
      if (isCleanedUp) {
        return;
      }

      isCleanedUp = true;

      const entry = this.channelRegistry.get(registryKey);

      if (!entry) {
        return;
      }

      entry.handlers.delete(handler);

      if (entry.handlers.size > 0) {
        console.info("[Realtime] Channel subscriber removed, channel kept alive.", {
          channelName: entry.channelName,
          remainingHandlers: entry.handlers.size,
          topic: entry.topic,
        });
        return;
      }

      console.info("[Realtime] Cleaning up channel.", {
        channelName: entry.channelName,
        topic: entry.topic,
      });
      this.channelRegistry.delete(registryKey);
      void client.removeChannel(entry.channel);
    };
  }
}
