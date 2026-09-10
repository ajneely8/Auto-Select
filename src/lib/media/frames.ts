/**
 * Frame-sequence loader for the 360° viewer.
 *
 * Strategy:
 *  1. Poster/first frame loads with the page (cheap).
 *  2. When the viewer nears the viewport, frames around the current angle are preloaded (±radius).
 *  3. When the shopper starts interacting, the full sequence streams in with limited concurrency,
 *     nearest-to-current-frame first, reporting progress.
 * Decoded images are cached, so swapping `src` between frames never re-downloads.
 */
export const SUPPORTED_FRAME_COUNTS = [36, 48, 72] as const;

export interface FrameLoader {
  count: number;
  isLoaded(i: number): boolean;
  failed(): number;
  loadedCount(): number;
  /** Nearest loaded frame to `i` (so rotation never shows a blank while frames stream in). */
  nearestLoaded(i: number): number;
  preloadAround(i: number, radius?: number): Promise<void>;
  loadAll(from?: number): Promise<void>;
  dispose(): void;
}

export function wrapIndex(i: number, count: number) {
  return ((i % count) + count) % count;
}

export function createFrameLoader(frames: string[], { concurrency = 6, onProgress }: { concurrency?: number; onProgress?: (loaded: number, total: number, failed: number) => void } = {}): FrameLoader {
  const count = frames.length;
  const state = new Array<"idle" | "loading" | "ok" | "error">(count).fill("idle");
  const pending = new Map<number, Promise<void>>();
  let disposed = false;
  let failedN = 0;
  let loadedN = 0;

  function load(i: number): Promise<void> {
    i = wrapIndex(i, count);
    if (state[i] === "ok" || state[i] === "error") return Promise.resolve();
    const existing = pending.get(i);
    if (existing) return existing;
    state[i] = "loading";
    const p = new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const done = () => {
          if (disposed) return resolve();
          state[i] = "ok";
          loadedN++;
          onProgress?.(loadedN, count, failedN);
          resolve();
        };
        // decode() keeps frame swaps jank-free; fall back if unsupported.
        if (img.decode) img.decode().then(done, done);
        else done();
      };
      img.onerror = () => {
        state[i] = "error";
        failedN++;
        onProgress?.(loadedN, count, failedN);
        resolve();
      };
      img.src = frames[i];
    }).finally(() => pending.delete(i));
    pending.set(i, p);
    return p;
  }

  async function runQueue(order: number[]) {
    let cursor = 0;
    const worker = async () => {
      while (!disposed && cursor < order.length) await load(order[cursor++]);
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, order.length) }, worker));
  }

  /** Indices ordered by distance from `from`, alternating directions: from, from+1, from-1, from+2, … */
  function byDistance(from: number, radius = count) {
    const out: number[] = [wrapIndex(from, count)];
    for (let d = 1; d <= Math.min(radius, Math.floor(count / 2)); d++) {
      out.push(wrapIndex(from + d, count));
      if (d !== count / 2) out.push(wrapIndex(from - d, count));
    }
    return out;
  }

  return {
    count,
    isLoaded: (i) => state[wrapIndex(i, count)] === "ok",
    failed: () => failedN,
    loadedCount: () => loadedN,
    nearestLoaded(i) {
      for (const j of byDistance(i)) if (state[j] === "ok") return j;
      return wrapIndex(i, count);
    },
    preloadAround: (i, radius = 3) => runQueue(byDistance(i, radius)),
    loadAll: (from = 0) => runQueue(byDistance(from)),
    dispose() {
      disposed = true;
    },
  };
}
