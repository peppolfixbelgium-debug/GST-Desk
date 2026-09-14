import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { AUTH_MIGRATION, isMigrationFile, pendingMigrations, projectRoot } from "./migration-plan.mjs";

test("pending migrations are returned in name order", () => {
  assert.deepEqual(
    pendingMigrations(["migrations/0002.sql", "migrations/0001.sql", "migrations/nope.txt"], []),
    [
      { name: "0001.sql", path: "migrations/0001.sql" },
      { name: "0002.sql", path: "migrations/0002.sql" },
    ],
  );
});

test("non-.sql entries are dropped", () => {
  assert.equal(isMigrationFile("auth"), false);
  assert.deepEqual(pendingMigrations(["auth", "README.md"], []), []);
});

test("the production migration directory contains only root SQL migrations", () => {
  const migrationsDir = join(projectRoot(), "migrations");
  const files = readdirSync(migrationsDir).filter(isMigrationFile).sort();
  assert.deepEqual(files, [
    "0001_auth.sql",
    "0002_conversions.sql",
    "0003_india_defaults.sql",
    "0004_better_auth_quota.sql",
    "0005_better_auth_server_only.sql",
  ]);
  assert.ok(readdirSync(join(migrationsDir, "auth")).includes(AUTH_MIGRATION));
});

test("this workspace's auth schema copy is byte-identical to its source", () => {
  const root = projectRoot();
  const source = readFileSync(join(root, "migrations", "auth", AUTH_MIGRATION), "utf8");
  const copy = readFileSync(join(root, "migrations", "0001_auth.sql"), "utf8");
  assert.equal(copy, source);
});

test("the copy check reads both files and catches an edit", () => {
  const root = projectRoot();
  const source = readFileSync(join(root, "migrations", "auth", AUTH_MIGRATION), "utf8");
  const copy = readFileSync(join(root, "migrations", "0001_auth.sql"), "utf8");
  assert.equal(typeof source, "string");
  assert.equal(typeof copy, "string");
  assert.equal(copy, source);
});
