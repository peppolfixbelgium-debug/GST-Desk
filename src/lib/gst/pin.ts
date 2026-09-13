/**
 * Partial local PIN-prefix fixture. It is NOT the authoritative IRP PIN master.
 * A missing mapping means "unknown locally", not "proven mismatch".
 */
const PIN2_STATE: Record<string, string> = {
  "11": "07", "12": "06", "13": "03", "14": "04", "16": "04", "17": "02", "18": "01", "19": "01",
  "20": "09", "21": "09", "22": "09", "23": "09", "24": "09", "25": "09", "26": "09", "27": "09", "28": "09",
  "30": "08", "31": "08", "32": "08", "33": "08", "34": "08", "36": "24", "37": "24", "38": "24", "39": "24",
  "40": "27", "41": "27", "42": "27", "43": "27", "44": "27", "45": "23", "46": "23", "47": "23", "48": "23",
  "49": "22", "50": "36", "51": "37", "52": "37", "53": "37", "56": "29", "57": "29", "58": "29", "59": "29",
  "60": "33", "61": "33", "62": "33", "63": "33", "64": "33", "67": "32", "68": "32", "69": "32", "70": "19",
  "71": "19", "72": "19", "73": "19", "74": "19", "75": "21", "76": "21", "77": "21", "78": "18", "79": "12",
  "80": "10", "81": "10", "82": "20", "83": "20", "84": "10", "85": "10",
};

export const PIN_FOR_STATE: Record<string, number> = {
  "01": 180001, "02": 171001, "03": 141001, "04": 160017, "05": 248001, "06": 122001, "07": 110001,
  "08": 302001, "09": 226001, "10": 800001, "19": 700001, "20": 834001, "21": 751001, "22": 492001,
  "23": 462001, "24": 380001, "27": 400001, "29": 560001, "32": 682001, "33": 600001, "36": 500001, "37": 530001,
};

export function pinOk(pin: number): boolean {
  return Number.isInteger(pin) && pin >= 100000 && pin <= 999999;
}

export function pinState(pin: number): string | null {
  if (!pinOk(pin)) return null;
  return PIN2_STATE[String(pin).slice(0, 2)] ?? null;
}

export type PinStateCheck = "match" | "mismatch" | "unknown";

export function checkPinState(pin: number, stcd: string): PinStateCheck {
  if (!pinOk(pin)) return "mismatch";
  const mapped = pinState(pin);
  if (!mapped) return "unknown";
  return mapped === stcd ? "match" : "mismatch";
}

/** Backward-compatible boolean helper. Prefer checkPinState() in validators. */
export function pinMatchesState(pin: number, stcd: string): boolean {
  return checkPinState(pin, stcd) === "match";
}
