"use client";

import { useEffect, useRef, useState } from "react";
import {
  blockonomicsPaymentEventSchema,
  blockonomicsPaymentWebSocketUrl,
  type BlockonomicsPaymentEvent,
} from "@/lib/btc-provider/client";

type SocketState = "idle" | "connecting" | "listening" | "closed" | "error";

/**
 * Browser-side payment detection via Blockonomics WebSocket.
 * For UX only — never treat as fulfillment; server callback is source of truth.
 * @see https://developers.blockonomics.co/reference/get_payment-addr
 */
export function useBlockonomicsPaymentSocket(
  address: string | null,
  options?: { enabled?: boolean; onEvent?: (event: BlockonomicsPaymentEvent) => void },
) {
  const enabled = options?.enabled ?? Boolean(address);
  const [state, setState] = useState<SocketState>("idle");
  const [lastEvent, setLastEvent] = useState<BlockonomicsPaymentEvent | null>(null);
  const onEventRef = useRef(options?.onEvent);
  onEventRef.current = options?.onEvent;

  useEffect(() => {
    if (!enabled || !address) {
      setState("idle");
      return;
    }

    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let ws: WebSocket | undefined;

    function connect() {
      if (closed) return;
      setState("connecting");
      ws = new WebSocket(blockonomicsPaymentWebSocketUrl(address));

      ws.onopen = () => {
        if (!closed) setState("listening");
      };

      ws.onmessage = (event) => {
        try {
          const data = blockonomicsPaymentEventSchema.parse(JSON.parse(String(event.data)));
          setLastEvent(data);
          onEventRef.current?.(data);
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = () => {
        if (!closed) setState("error");
      };

      ws.onclose = () => {
        if (closed) {
          setState("closed");
          return;
        }
        setState("closed");
        reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      setState("closed");
    };
  }, [address, enabled]);

  return { state, lastEvent };
}
