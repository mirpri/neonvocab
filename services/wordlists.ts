// Dynamic wordlist loader to avoid eager imports
// Supports presets and the consolidated sum.txt file

export type PresetName = "Highschool" | "TOEFL" | "CET" | "sum";

export async function loadWordlistPreset(name: PresetName): Promise<string> {
  switch (name) {
    case "Highschool": {
      const mod = await import("../wordlists/Highschool.txt?raw");
      return (mod.default as string) || "";
    }
    case "TOEFL": {
      const mod = await import("../wordlists/TOEFL.txt?raw");
      return (mod.default as string) || "";
    }
    case "CET": {
      const mod = await import("../wordlists/CET.txt?raw");
      return (mod.default as string) || "";
    }
    case "sum": {
      const mod = await import("../wordlists/sum.txt?raw");
      return (mod.default as string) || "";
    }
    default:
      return "";
  }
}

export function parseWords(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function pickRandomUnique<T>(arr: T[], count: number): T[] {
  const result: T[] = [];
  if (count <= 0 || arr.length === 0) return result;
  const pool = [...arr];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

function stringToSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickSeededRandomUnique<T>(arr: T[], count: number, seedStr: string): T[] {
  const result: T[] = [];
  if (count <= 0 || arr.length === 0) return result;
  const pool = [...arr];
  const rng = mulberry32(stringToSeed(seedStr));
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}
