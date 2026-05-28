/**
 * Mirrors console output to the backend's `POST /api/devlogs` endpoint so the
 * operator can read users' debug traces from `pm2 logs taskfi-backend` instead
 * of asking each user to copy-paste their browser console.
 *
 * Best-effort fire-and-forget: a network failure on the POST is swallowed —
 * the local `console.*` call still happens, so DevTools remains the source of
 * truth for the user.
 *
 * No PII, no wallet keys — only the debug strings that the call sites already
 * pass to `dashLogger.info(...)`. The session id is random per page load, so
 * the operator can group a single user's flow across multiple calls.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  ts: number;
  level: LogLevel;
  message: string;
  ctx?: Record<string, unknown>;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
const SESSION_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const queue: LogEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY_MS = 800;
const FLUSH_BATCH_MAX = 50;

function scheduleFlush() {
  if (flushTimer || queue.length === 0) return;
  flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
}

async function flush() {
  flushTimer = null;
  if (!API_URL || queue.length === 0) return;
  const batch = queue.splice(0, FLUSH_BATCH_MAX);
  try {
    await fetch(`${API_URL}/api/devlogs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, entries: batch }),
      keepalive: true,
    });
  } catch {
    // network error — drop the batch. Keeping a queue across failures risks
    // unbounded growth in offline scenarios.
  }
  if (queue.length > 0) scheduleFlush();
}

/** Stringify objects in a console-friendly way for the console mirror. */
function stringifyCtx(ctx: Record<string, unknown> | undefined): string {
  if (!ctx) return '';
  try {
    return ' ' + JSON.stringify(ctx, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
  } catch {
    return '';
  }
}

function log(level: LogLevel, message: string, ctx?: Record<string, unknown>) {
  const consoleLine = `[${SESSION_ID}] ${message}${stringifyCtx(ctx)}`;
  switch (level) {
    case 'error':
      // eslint-disable-next-line no-console
      console.error(consoleLine);
      break;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(consoleLine);
      break;
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(consoleLine);
      break;
    default:
      // eslint-disable-next-line no-console
      console.info(consoleLine);
  }
  // Serialize ctx safely (drop unencodable values) before sending.
  let safeCtx: Record<string, unknown> | undefined;
  if (ctx) {
    try {
      safeCtx = JSON.parse(
        JSON.stringify(ctx, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)),
      ) as Record<string, unknown>;
    } catch {
      safeCtx = { unserializable: true };
    }
  }
  queue.push({ ts: Date.now(), level, message, ctx: safeCtx });
  scheduleFlush();
}

// Flush any pending entries when the user leaves the page.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (queue.length === 0 || !API_URL) return;
    const batch = queue.splice(0, FLUSH_BATCH_MAX);
    try {
      const body = JSON.stringify({ sessionId: SESSION_ID, entries: batch });
      navigator.sendBeacon(`${API_URL}/api/devlogs`, new Blob([body], { type: 'application/json' }));
    } catch {
      // best-effort
    }
  });
}

export const dashLogger = {
  info: (message: string, ctx?: Record<string, unknown>) => log('info', message, ctx),
  warn: (message: string, ctx?: Record<string, unknown>) => log('warn', message, ctx),
  error: (message: string, ctx?: Record<string, unknown>) => log('error', message, ctx),
  debug: (message: string, ctx?: Record<string, unknown>) => log('debug', message, ctx),
  /** The random session id chosen at module load — exposed so call sites can show it in toasts/etc. */
  sessionId: SESSION_ID,
};
