// Base URL of the Django backend. Defaults to a *relative* path so the
// browser always sees the API as same-origin: nginx proxies it in prod
// (see nginx-templates/default.conf.template) and the CRA dev server
// proxies it in local dev (see the "proxy" field in package.json).
// This avoids CORS/SameSite cookie issues with the session-based login.
export const API_BASE = process.env.REACT_APP_API_BASE || '/djangoapp';
