// Timeout helpers for the network layer. Every remote call in src/net is
// bounded so that a stalled connection can never block gameplay (DESIGN §10).

export const DEFAULT_TIMEOUT_MS = 4000;

export class TimeoutError extends Error {
  override readonly name = 'TimeoutError';
  constructor(label = 'operation', ms = DEFAULT_TIMEOUT_MS) {
    super(`${label} timed out after ${ms} ms`);
  }
}

/**
 * Resolve/reject with `promise`, or reject with TimeoutError after `ms`.
 * The timer is cleared as soon as the promise settles.
 * Accepts thenables (PostgREST query builders are thenables, not Promises).
 */
export function withTimeout<T>(promise: PromiseLike<T>, ms = DEFAULT_TIMEOUT_MS, label = 'operation'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new TimeoutError(label, ms));
    }, ms);
    Promise.resolve(promise).then(
      (v) => { if (done) return; done = true; clearTimeout(timer); resolve(v); },
      (e) => { if (done) return; done = true; clearTimeout(timer); reject(e); },
    );
  });
}

/**
 * Run `fn` with a timeout and swallow every failure (network, CSP TypeError,
 * timeout, malformed response) into `fallback`. Never throws, never rejects.
 */
export async function guarded<T>(fn: () => PromiseLike<T>, fallback: T, ms = DEFAULT_TIMEOUT_MS, label = 'operation', onError?: (e: unknown) => void): Promise<T> {
  try {
    return await withTimeout(fn(), ms, label);
  } catch (e) {
    onError?.(e);
    return fallback;
  }
}
