import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef } from "react";

import { services } from "../services/composition-root";
import { useAppStore } from "../state/app-store";

export function useTablesRealtimeSync() {
  const isFocused = useIsFocused();
  const markRealtimeEvent = useAppStore((state) => state.markRealtimeEvent);
  const setConnectionState = useAppStore((state) => state.setConnectionState);
  const setTables = useAppStore((state) => state.setTables);
  const callbacksRef = useRef({
    markRealtimeEvent,
    setConnectionState,
    setTables,
  });

  callbacksRef.current = {
    markRealtimeEvent,
    setConnectionState,
    setTables,
  };

  useEffect(() => {
    if (!isFocused) {
      console.info("[useTablesRealtimeSync] Skipping tables-overview subscription because screen is not focused.");
      return;
    }

    console.info("[useTablesRealtimeSync] Creating tables-overview subscription.");
    const unsubscribe = services.realtimeSync.subscribeTablesOverview({
      onConnectionStateChange: (nextState) => {
        callbacksRef.current.setConnectionState(nextState);
      },
      onRealtimeEvent: () => {
        callbacksRef.current.markRealtimeEvent();
      },
      onTablesSnapshot: (tables) => {
        callbacksRef.current.setTables(tables);
      },
    });

    return () => {
      console.info("[useTablesRealtimeSync] Cleaning up tables-overview subscription.");
      unsubscribe();
    };
  }, [isFocused]);
}
