export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Shared helper — validates env vars and builds the OAuth portal URL.
const buildOAuthUrl = (type: "signIn" | "signUp"): string => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  if (!oauthPortalUrl) {
    throw new Error(
      "Misconfigured environment: VITE_OAUTH_PORTAL_URL is missing or empty. " +
        "Set it to a valid absolute URL (e.g. https://oauth.example.com)."
    );
  }

  let portalBase: URL;
  try {
    portalBase = new URL(oauthPortalUrl);
  } catch {
    throw new Error(
      `Misconfigured environment: VITE_OAUTH_PORTAL_URL="${oauthPortalUrl}" is not a valid absolute URL. ` +
        "Ensure it includes a scheme (e.g. https://oauth.example.com)."
    );
  }

  if (!portalBase.protocol.startsWith("http")) {
    throw new Error(
      `Misconfigured environment: VITE_OAUTH_PORTAL_URL="${oauthPortalUrl}" must use http or https.`
    );
  }

  if (!appId) {
    throw new Error(
      "Misconfigured environment: VITE_APP_ID is missing or empty. " +
        "Set it to your application's OAuth app ID."
    );
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL("/app-auth", portalBase);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", type);

  return url.toString();
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => buildOAuthUrl("signIn");

// Generate sign-up URL — same OAuth portal but with type=signUp
export const getSignUpUrl = () => buildOAuthUrl("signUp");
