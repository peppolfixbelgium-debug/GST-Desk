export type HsnRow = {
  code: string;
  desc: string;
  rate: number;
  service: boolean;
};

/** Compact IRP-style master used for 2176 / 3047 / 3048 and rate checks. */
export const HSN: HsnRow[] = [
  { code: "1001", desc: "Wheat and meslin", rate: 5, service: false },
  { code: "1006", desc: "Rice", rate: 5, service: false },
  { code: "1701", desc: "Cane or beet sugar", rate: 5, service: false },
  { code: "2201", desc: "Waters", rate: 18, service: false },
  { code: "2402", desc: "Cigars and cigarettes", rate: 28, service: false },
  { code: "2505", desc: "Natural sands", rate: 5, service: false },
  { code: "2710", desc: "Petroleum oils", rate: 18, service: false },
  { code: "3004", desc: "Medicaments", rate: 12, service: false },
  { code: "3926", desc: "Plastic articles", rate: 18, service: false },
  { code: "4802", desc: "Uncoated paper", rate: 12, service: false },
  { code: "4901", desc: "Printed books", rate: 0, service: false },
  { code: "6109", desc: "T-shirts", rate: 5, service: false },
  { code: "6203", desc: "Men's suits", rate: 12, service: false },
  { code: "6403", desc: "Footwear", rate: 18, service: false },
  { code: "7308", desc: "Structures of iron or steel", rate: 18, service: false },
  { code: "8471", desc: "Automatic data processing machines", rate: 18, service: false },
  { code: "8504", desc: "Electrical transformers", rate: 18, service: false },
  { code: "8517", desc: "Telephones", rate: 18, service: false },
  { code: "8544", desc: "Insulated wire and cable", rate: 18, service: false },
  { code: "8703", desc: "Motor cars", rate: 28, service: false },
  { code: "9018", desc: "Medical instruments", rate: 12, service: false },
  { code: "9403", desc: "Other furniture", rate: 18, service: false },
  { code: "9503", desc: "Toys", rate: 12, service: false },
  { code: "9963", desc: "Accommodation / F&B services", rate: 18, service: true },
  { code: "9972", desc: "Real estate services", rate: 18, service: true },
  { code: "9973", desc: "Leasing or rental services", rate: 18, service: true },
  { code: "9982", desc: "Legal and accounting services", rate: 18, service: true },
  { code: "998221", desc: "Chartered accountancy", rate: 18, service: true },
  { code: "9983", desc: "Other professional services", rate: 18, service: true },
  { code: "998313", desc: "IT consulting", rate: 18, service: true },
  { code: "998314", desc: "IT design and development", rate: 18, service: true },
  { code: "9987", desc: "Maintenance and repair", rate: 18, service: true },
];

const byCode = new Map(HSN.map((h) => [h.code, h]));

/** Exact master lookup only. Prefix matching is unsafe for HSN/SAC classification. */
export function lookupHsn(code: string): HsnRow | undefined {
  const c = code.replace(/\s/g, "");
  return byCode.get(c);
}

export function hsnFormatOk(code: string): boolean {
  return /^\d{4}$|^\d{6}$|^\d{8}$/.test(code.replace(/\s/g, ""));
}

export const UQC = ["NOS", "PCS", "KGS", "MTR", "LTR", "BOX", "SET", "SQF", "UNT", "HRS", "BAG", "CTN"] as const;
