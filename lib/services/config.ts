/** Server-side service configuration. Never import this module from a client component. */

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const deployed = ["production", "staging"].includes(
  (process.env.OPENCONTENT_ENV ?? process.env.NODE_ENV ?? "development").toLowerCase()
);

function configuredUrl(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  if (value) return value.replace(/\/$/, "");
  if (deployed && !isBuildPhase) {
    throw new Error(`${name} must be configured in ${process.env.OPENCONTENT_ENV ?? process.env.NODE_ENV}`);
  }
  return fallback;
}

export const SERVICE_CONFIG = {
  auth: {
    baseUrl: configuredUrl("AUTH_SERVICE_URL", "http://127.0.0.1:8081"),
    timeoutMs: 1500,
  },
  profile: {
    baseUrl: configuredUrl("PROFILE_SERVICE_URL", "http://127.0.0.1:8082"),
    timeoutMs: 1500,
  },
  signin: {
    baseUrl: configuredUrl("SIGNIN_SERVICE_URL", "http://127.0.0.1:8083"),
    timeoutMs: 1500,
  },
  signup: {
    baseUrl: configuredUrl("SIGNUP_SERVICE_URL", "http://127.0.0.1:8084"),
    timeoutMs: 1500,
  },
  comments: {
    baseUrl: configuredUrl("COMMENTS_SERVICE_URL", "http://127.0.0.1:8085"),
    timeoutMs: 1500,
  },
  likes: {
    baseUrl: configuredUrl("LIKES_SERVICE_URL", "http://127.0.0.1:8096"),
    timeoutMs: 1500,
  },
  dislikes: {
    baseUrl: configuredUrl("DISLIKES_SERVICE_URL", "http://127.0.0.1:8087"),
    timeoutMs: 1500,
  },
  views: {
    baseUrl: configuredUrl("VIEWS_SERVICE_URL", "http://127.0.0.1:8088"),
    timeoutMs: 1500,
  },
  mediaplayer: {
    baseUrl: configuredUrl("MEDIAPLAYER_SERVICE_URL", "http://127.0.0.1:8089"),
    timeoutMs: 1500,
  },
  channels: { baseUrl: configuredUrl("CHANNELS_SERVICE_URL", "http://127.0.0.1:8092"), timeoutMs: 4000 },
  videos: { baseUrl: configuredUrl("VIDEOS_SERVICE_URL", "http://127.0.0.1:8091"), timeoutMs: 10000 },
  shop: { baseUrl: configuredUrl("SHOP_SERVICE_URL", "http://127.0.0.1:8093"), timeoutMs: 4000 },
  ads: { baseUrl: configuredUrl("ADS_SERVICE_URL", "http://127.0.0.1:8090"), timeoutMs: 4000 },
} as const;

export type ServiceName = keyof typeof SERVICE_CONFIG;

export const serviceUrl = (service: ServiceName): string => SERVICE_CONFIG[service].baseUrl;
