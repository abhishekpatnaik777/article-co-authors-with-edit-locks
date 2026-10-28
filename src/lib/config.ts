const DEFAULT_LOCK_TTL_MS = 300_000;

export const LOCK_TTL_MS = Number(process.env.LOCK_TTL_MS ?? DEFAULT_LOCK_TTL_MS);
export const HEARTBEAT_INTERVAL_MS = 45_000;