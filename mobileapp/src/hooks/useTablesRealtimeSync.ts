import { useEffect } from "react";

import { services } from "../services/composition-root";
import { useAppStore } from "../state/app-store";

export function useTablesRealtimeSync() {
  const markRealtimeEvent = useAppStore((state) => state.markRealtimeEvent);
  const setConnectionState = useAppStore((state) => state.setConnectionState);
  const setTables = useAppStore((state) => state.setTables);

  useEffect(() => {
    return services.realtimeSync.subscribeTablesOverview({
      onConnectionStateChange: setConnectionState,
      onRealtimeEvent: markRealtimeEvent,
      onTablesSnapshot: setTables,
    });
  }, [markRealtimeEvent, setConnectionState, setTables]);
}
