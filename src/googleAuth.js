// googleAuth.js
// Thin wrapper around Google Identity Services (GIS) for "Sign in with Google".
//
// Setup: create an OAuth 2.0 Client ID (type: Web application) in Google
// Cloud Console, add your GitHub Pages URL under "Authorized JavaScript
// origins", and paste the Client ID below. See the README for exact steps.

const GOOGLE_CLIENT_ID = "269657682935-0t42sehlidt7oqsp5okd95592rii6r35.apps.googleusercontent.com";

let gisLoaded = false;

function loadGis() {
  return new Promise((resolve, reject) => {
    if (gisLoaded && window.google?.accounts?.id) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function decodeJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(json);
}

/**
 * Renders the Google "Sign in" button into the given DOM element and
 * resolves with { name, email, picture } once the user signs in.
 * Optionally restrict to a domain (e.g. "gndr.org") via ALLOWED_DOMAIN below.
 */
const ALLOWED_DOMAIN = ""; // e.g. "gndr.org" — leave blank to allow any Google account

export function renderGoogleSignIn(elementId) {
  return new Promise(async (resolve, reject) => {
    await loadGis();
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        try {
          const profile = decodeJwt(response.credential);
          if (ALLOWED_DOMAIN && profile.hd !== ALLOWED_DOMAIN) {
            reject(new Error(`Please sign in with your @${ALLOWED_DOMAIN} account.`));
            return;
          }
          resolve({ name: profile.name, email: profile.email, picture: profile.picture });
        } catch (e) {
          reject(e);
        }
      },
    });
    window.google.accounts.id.renderButton(document.getElementById(elementId), {
      theme: "outline",
      size: "large",
      shape: "pill",
    });
  });
}
