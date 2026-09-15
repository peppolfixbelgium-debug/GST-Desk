/**
 * Upstream identity provider used for federated sign-in.
 *
 * Google is intentionally the only social sign-in option. Email/password
 * account creation and sign-in are handled separately by Better Auth.
 */
export type GrokProvider = {
  /** This app's local provider id; also the OAuth callback path segment. */
  providerId: string;
  /** Upstream identity hint sent to the auth broker. */
  idp: string;
  /** Human label for the sign-in button. */
  label: string;
};

export const GROK_PROVIDERS: readonly GrokProvider[] = [
  { providerId: "grok-google", idp: "google", label: "Google" },
];
