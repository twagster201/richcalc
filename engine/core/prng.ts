/**
 * Seeded, reproducible random numbers.
 *
 * sfc32 is a small, fast generator with a 128-bit state that passes PractRand. Each simulated
 * variable gets its own stream derived from (seed, stream name), so adding a new variable later
 * never changes the numbers drawn for existing ones.
 */

export interface Rng {
  /** Uniform on [0, 1). */
  next(): number;
  /** Standard normal N(0, 1). */
  normal(): number;
  /** Student-t with `df` degrees of freedom, rescaled to unit variance (requires df > 2). */
  studentT(df: number): number;
  /** Chi-squared with integer `df`. */
  chiSquared(df: number): number;
}

/** 32-bit FNV-1a hash of a string, used to turn stream names into seeds. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function splitmix32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x9e3779b9) | 0;
    let z = a;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return (z ^ (z >>> 16)) >>> 0;
  };
}

export function createRng(seed: number, stream = 'main'): Rng {
  const init = splitmix32((seed >>> 0) ^ hashString(stream));
  let a = init();
  let b = init();
  let c = init();
  let d = init();

  const nextU32 = (): number => {
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return t >>> 0;
  };
  // Discard the first outputs so closely related seeds diverge quickly.
  for (let i = 0; i < 12; i++) nextU32();

  let spare: number | null = null;

  const next = (): number => nextU32() / 4294967296;

  const normal = (): number => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    // Box–Muller. 1 - next() is in (0, 1], so the log is finite.
    const u = 1 - next();
    const v = next();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };

  const chiSquared = (df: number): number => {
    let sum = 0;
    for (let i = 0; i < df; i++) {
      const z = normal();
      sum += z * z;
    }
    return sum;
  };

  const studentT = (df: number): number => {
    const z = normal();
    const scale = Math.sqrt((df - 2) / chiSquared(df));
    return z * scale;
  };

  return { next, normal, studentT, chiSquared };
}
