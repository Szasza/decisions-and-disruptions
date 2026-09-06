/**
 * Formats the time elapsed between `fromMs` and `nowMs` as a short,
 * human-readable relative string (e.g. "just now", "12s ago", "3m ago",
 * "2h ago"). Pure function, no I/O, no i18n.
 */
export function formatRelativeTime(
  fromMs: number,
  nowMs: number = Date.now(),
): string {
  const elapsedMs = nowMs - fromMs;

  if (elapsedMs < 5_000) {
    return "just now";
  }

  if (elapsedMs < 60_000) {
    const elapsedSeconds = elapsedMs / 1_000;
    return `${Math.floor(elapsedSeconds)}s ago`;
  }

  if (elapsedMs < 3_600_000) {
    const elapsedMinutes = elapsedMs / 60_000;
    return `${Math.floor(elapsedMinutes)}m ago`;
  }

  const elapsedHours = elapsedMs / 3_600_000;
  return `${Math.floor(elapsedHours)}h ago`;
}
