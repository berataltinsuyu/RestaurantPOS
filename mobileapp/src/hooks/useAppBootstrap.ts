import { useEffect } from "react";

import { services } from "../services/composition-root";
import { useAppStore } from "../state/app-store";

export function useAppBootstrap() {
  const markRealtimeEvent = useAppStore((state) => state.markRealtimeEvent);
  const setConnectionState = useAppStore((state) => state.setConnectionState);

  useEffect(() => {
    const stop = services.realtimeSync.start({
      onConnectionStateChange: setConnectionState,
      onRealtimeEvent: markRealtimeEvent,
    });

    return stop;
  }, [markRealtimeEvent, setConnectionState]);
}
