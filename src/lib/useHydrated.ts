import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True once running in the browser — for UI that depends on persisted client state (the bag). */
export const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);
