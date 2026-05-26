import { useSyncExternalStore } from "react";

/**
 * False on the server and during hydration; true after the client has mounted.
 * Use to defer Radix/shadcn components whose useId() differs between SSR and CSR.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
