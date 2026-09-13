const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function gstinCheckDigit(first14: string): string {
  let factor = 2;
  let sum = 0;
  const code = first14.toUpperCase();
  for (let i = code.length - 1; i >= 0; i--) {
    let cp = CHARS.indexOf(code[i]) * factor;
    factor = factor === 2 ? 1 : 2;
    if (cp < 0) return "";
    cp = Math.floor(cp / CHARS.length) + (cp % CHARS.length);
    sum += cp;
  }
  const check = (CHARS.length - (sum % CHARS.length)) % CHARS.length;
  return CHARS[check] ?? "";
}

export function normalizeGstin(raw: string): string {
  return raw.replace(/\s/g, "").toUpperCase();
}

export function isGstinShape(raw: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(normalizeGstin(raw));
}

export function gstinOk(raw: string): boolean {
  const g = normalizeGstin(raw);
  if (!isGstinShape(g)) return false;
  return gstinCheckDigit(g.slice(0, 14)) === g[14];
}

export function gstinState(raw: string): string {
  return normalizeGstin(raw).slice(0, 2);
}

export function makeGstin(state: string, pan: string, entity = "1"): string {
  const first14 = `${state}${pan.toUpperCase()}${entity}Z`;
  return first14 + gstinCheckDigit(first14);
}
