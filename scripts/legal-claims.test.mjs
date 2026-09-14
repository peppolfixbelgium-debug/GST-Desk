import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

test("public GST claims keep the IRN/GSP boundary explicit", async () => {
  const [home, terms, security, metadata, pricing] = await Promise.all([
    read("src/routes/index.tsx"),
    read("src/routes/terms.tsx"),
    read("src/routes/security.tsx"),
    read("src/routes/__root.tsx"),
    read("src/lib/gst/pricing.ts"),
  ]);

  const publicCopy = `${home}\n${terms}\n${security}\n${metadata}\n${pricing}`;

  assert.match(publicCopy, /not a GSP|not a GST Suvidha Provider/i);
  assert.match(publicCopy, /does not .*obtain an IRN|IRN issuance are separate/i);
  assert.doesNotMatch(publicCopy, /GSP-adjacent volume/i);
  assert.doesNotMatch(home, /NIC said/i);
  assert.doesNotMatch(home, /file through NIC or ClearTax \/ HostBooks/i);
  assert.match(terms, /IRN-ready means only that a file passed GST Desk local validation checks/i);
});

test("privacy and security pages do not make absolute unverified data/security claims", async () => {
  const [privacy, security] = await Promise.all([
    read("src/routes/privacy.tsx"),
    read("src/routes/security.tsx"),
  ]);

  assert.match(privacy, /Do not assume invoice data is never transmitted or stored/i);
  assert.match(security, /intentionally avoids security guarantees that have not yet been verified/i);
  assert.match(security, /Production authentication, server-side authorization and database tenant isolation must be independently verified/i);
});
