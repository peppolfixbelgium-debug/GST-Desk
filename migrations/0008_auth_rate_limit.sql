-- Persistent Better Auth rate-limit storage.
-- Better Auth uses the connecting client IP as the default rate-limit key and
-- performs the consume operation atomically through its database adapter.
-- Keep the camelCase column names because Better Auth queries them by model
-- field name, matching the existing generated auth schema.

create table if not exists "authRateLimit" (
  "id" text not null primary key,
  "key" text not null unique,
  "count" integer not null,
  "lastRequest" bigint not null
);

create index if not exists "authRateLimit_lastRequest_idx"
  on "authRateLimit" ("lastRequest");
