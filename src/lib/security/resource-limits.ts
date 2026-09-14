export const MAX_SINGLE_JSON_BYTES = 2 * 1024 * 1024;
export const MAX_BULK_FILES = 20;
export const MAX_BULK_JSON_BYTES = 2 * 1024 * 1024;
export const MAX_BULK_TOTAL_BYTES = 20 * 1024 * 1024;
export const MAX_BULK_OUTPUT_FILES = 20;

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function assertJsonTextWithinLimit(value: string, maxBytes = MAX_SINGLE_JSON_BYTES): void {
  if (utf8ByteLength(value) > maxBytes) {
    throw new Error(`JSON input exceeds the ${Math.floor(maxBytes / 1024 / 1024)} MiB limit.`);
  }
}

export function validateBulkFiles(files: readonly { size: number }[]): string | null {
  if (files.length > MAX_BULK_FILES) {
    return `Bulk upload is limited to ${MAX_BULK_FILES} JSON files per run.`;
  }
  const oversized = files.find((file) => file.size > MAX_BULK_JSON_BYTES);
  if (oversized) {
    return `Each JSON file must be ${Math.floor(MAX_BULK_JSON_BYTES / 1024 / 1024)} MiB or smaller.`;
  }
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_BULK_TOTAL_BYTES) {
    return `Bulk upload is limited to ${Math.floor(MAX_BULK_TOTAL_BYTES / 1024 / 1024)} MiB total.`;
  }
  return null;
}
