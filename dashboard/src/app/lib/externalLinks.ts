const DEFAULT_WEBSITE_PORT = 5174;

function normalizeOrigin(origin: string): string {
  return origin.endsWith('/') ? origin.slice(0, -1) : origin;
}

export function getWebsiteOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_WEBSITE_ORIGIN;

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${DEFAULT_WEBSITE_PORT}`;
  }

  return `http://localhost:${DEFAULT_WEBSITE_PORT}`;
}

export function getWebsitePricingUrl(): string {
  return `${getWebsiteOrigin()}/pricing`;
}

export function getWebsiteAuthUrl(): string {
  return `${getWebsiteOrigin()}/auth`;
}
