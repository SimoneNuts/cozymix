/**
 * Sleep timer arithmetic. The timer stores an end time on the wall clock, so
 * a throttled background tab still stops on time.
 *
 * Pure module: no React, no DOM.
 */

export const TIMER_MINUTES = [15, 30, 45, 60, 90] as const;

/** The last stretch of the timer, during which the mix fades out. */
export const FADE_SECONDS = 30;

/** Gain multiplier for the fade: 1 until the last 30 seconds, then down to 0. */
export function fadeLevel(remainingMs: number): number {
  const seconds = remainingMs / 1000;
  if (seconds >= FADE_SECONDS) return 1;
  if (seconds <= 0) return 0;
  return seconds / FADE_SECONDS;
}

/** "14:05", or "1:02:00" past an hour. Rounds up so it never shows 0:00 early. */
export function formatRemaining(remainingMs: number): string {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`;
}
