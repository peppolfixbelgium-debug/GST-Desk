import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getAppEnv } from "@/lib/app-env";
import { getCurrentUser } from "@/lib/auth/server";
import { getUserTeam } from "@/lib/auth/team";
import { getDb } from "@/lib/db";

const require = createRequire(import.meta.url);
const appEnv = getAppEnv();
const FAILURE_MEMO_TTL_MS = 15_000;
const failureMemo = new Map<string, { at: number; result: CallToolResult }>();

function tokenFingerprint(token: string): string {
  const parts = token.split(".");
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(
        Buffer.from(parts[1], "base64url").toString("utf8"),
      );
      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        const { sub, team_id: teamId } = payload as {
          sub?: unknown;
          team_id?: unknown;
        };
        if (typeof sub === "string" && sub) {
          return createHash("sha256")
            .update(
              JSON.stringify([sub, typeof teamId === "string" ? teamId : null]),
            )
            .digest("base64url");
        }
      }
    } catch {
      // Invalid JWT-like input falls back to a hash of the opaque token.
    }
  }
  return createHash("sha256").update(token).digest("base64url");
}

function memoizedFailure(key: string | null): CallToolResult | null {
  if (!key) return null;
  const hit = failureMemo.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > FAILURE_MEMO_TTL_MS) {
    failureMemo.delete(key);
    return null;
  }
  return hit.result;
}

// ...
