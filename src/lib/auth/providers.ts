/**
 * Social identity providers used by the app.
 *
 * Google is the only social sign-in option. Email/password account creation
 * and sign-in are handled separately by Better Auth.
 */
export type GrokProvider = {
  /** Better Auth provider id and OAuth callback path segment. */
  providerId: "google";
  /** Human label for the sign-in button. */
  label: string;
};

export const GROK_PROVIDERS: readonly GrokProvider[] = [
  { providerId: "google", label: "Google" },
];
