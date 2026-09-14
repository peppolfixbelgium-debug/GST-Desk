# GST Desk production smoke verification

This checklist is the release evidence gate for the deployed application. It deliberately separates browser-observable production behavior from CI/build evidence.

## Preconditions

- Production deployment is `Ready` in Vercel.
- `VITE_AUTH_ENABLED` is not set to `false` in production.
- Production Better Auth credentials and `BETTER_AUTH_URL` are configured.
- `DATABASE_URL` points to the GST Desk Supabase Postgres endpoint/pooler.

## Smoke sequence

1. Open the production domain in a fresh/private browser session.
2. Confirm the application loads without a server error.
3. Sign in using a real configured identity provider.
4. Refresh the page and confirm the session remains authenticated.
5. Open Converter/History and confirm the monthly quota renders as a number, not an indefinite loading state.
6. Submit a valid sample invoice conversion.
7. Confirm the conversion succeeds and the corrected/downloadable JSON is available.
8. Open History and confirm the new conversion appears for the signed-in user.
9. Repeat until the configured monthly limit is reached; confirm the next save is rejected by the server rather than merely hidden by the UI.
10. Sign out, then confirm protected conversion/history actions are rejected and no prior session remains.
11. Sign in as a different user and confirm the previous user's history is not visible.

## Evidence to record

For each release candidate, record:

- Vercel deployment URL and commit SHA.
- CI run URL and final conclusion.
- Timestamp of the browser smoke test.
- Authentication result.
- Quota result before and after a successful conversion.
- History result.
- Quota-limit rejection result.
- Sign-out/protected-route result.
- Cross-user isolation result.

## Release rule

Do **not** mark production runtime GREEN from a successful build alone. The release remains blocked until the authenticated browser smoke sequence is completed against the production deployment and the evidence is recorded in the GitHub release ledger.
