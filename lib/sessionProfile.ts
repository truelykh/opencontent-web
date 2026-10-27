// Client-side session profiling for the anonymous profile view.
// Everything here is best-effort browser reporting: the UI must say so, and
// production decisions must also use server-side signals (IP geolocation,
// TLS fingerprint, request cadence, rate limits).

export type DeviceClass = "mobile" | "tablet" | "laptop" | "desktop";
export type Confidence = "high" | "medium" | "low";
export type CheckStatus = "pass" | "warn" | "fail";
export type BotVerdict =
  | "likely_human"
  | "needs_verification"
  | "likely_automated";

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
}

export interface DeviceInfo {
  deviceClass: DeviceClass;
  confidence: Confidence;
  signals: string[];
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  timezone: string;
  source: string;
}

export interface SessionDetails {
  timezone: string;
  locale: string;
  platform: string;
  screen: string;
  touch: boolean;
  cores: number | null;
}

export interface BotCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface BotReport {
  score: number;
  verdict: BotVerdict;
  checks: BotCheck[];
}

export interface SessionProfile {
  browser: BrowserInfo;
  device: DeviceInfo;
  country: CountryInfo;
  details: SessionDetails;
  bot: BotReport;
}

interface UADataBrand {
  brand: string;
  version: string;
}

interface UADataLike {
  brands?: UADataBrand[];
  mobile?: boolean;
  platform?: string;
}

const TZ_COUNTRY: Record<string, string> = {
  "Asia/Calcutta": "IN",
  "Asia/Kolkata": "IN",
  "Asia/Dubai": "AE",
  "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Singapore": "SG",
  "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN",
  "Asia/Hong_Kong": "HK",
  "Asia/Seoul": "KR",
  "Asia/Bangkok": "TH",
  "Asia/Jakarta": "ID",
  "Asia/Manila": "PH",
  "Asia/Riyadh": "SA",
  "Asia/Tel_Aviv": "IL",
  "Europe/Istanbul": "TR",
  "Europe/London": "GB",
  "Europe/Dublin": "IE",
  "Europe/Berlin": "DE",
  "Europe/Paris": "FR",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "Europe/Stockholm": "SE",
  "Europe/Zurich": "CH",
  "Europe/Moscow": "RU",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Pacific/Auckland": "NZ",
  "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Africa/Cairo": "EG",
};

function prettyBrand(brand: string): string {
  return brand
    .replace("Google ", "")
    .replace("Microsoft ", "")
    .replace(" Not A(Brand", "")
    .trim();
}

async function isBraveBrowser(): Promise<boolean> {
  try {
    const nav = navigator as Navigator & {
      brave?: { isBrave?: () => Promise<boolean> };
    };
    if (!nav.brave?.isBrave) return false;
    return (await nav.brave.isBrave()) === true;
  } catch {
    return false;
  }
}

function versionFrom(ua: string, pattern: RegExp): string {
  const match = ua.match(pattern);
  return match?.[1] ?? "—";
}

export async function detectBrowser(): Promise<BrowserInfo> {
  const ua = navigator.userAgent;
  const nav = navigator as Navigator & {
    userAgentData?: UADataLike;
    brave?: { isBrave?: () => Promise<boolean> };
  };
  const brave = await isBraveBrowser();
  const brand = nav.userAgentData?.brands?.find(
    (item) => !/Not.?A.?Brand|Chromium/i.test(item.brand)
  );

  if (brand) {
    return {
      name: brave ? "Brave" : prettyBrand(brand.brand),
      version: brand.version,
      engine: "Blink",
    };
  }

  if (brave) {
    return {
      name: "Brave",
      version: versionFrom(ua, /Chrome\/([\d.]+)/),
      engine: "Blink",
    };
  }

  if (/Edg\//.test(ua)) {
    return {
      name: "Edge",
      version: versionFrom(ua, /Edg\/([\d.]+)/),
      engine: "Blink",
    };
  }
  if (/OPR\//.test(ua)) {
    return {
      name: "Opera",
      version: versionFrom(ua, /OPR\/([\d.]+)/),
      engine: "Blink",
    };
  }
  if (/SamsungBrowser\//.test(ua)) {
    return {
      name: "Samsung Internet",
      version: versionFrom(ua, /SamsungBrowser\/([\d.]+)/),
      engine: "Blink",
    };
  }
  if (/FxiOS\//.test(ua)) {
    return {
      name: "Firefox (iOS)",
      version: versionFrom(ua, /FxiOS\/([\d.]+)/),
      engine: "WebKit",
    };
  }
  if (/CriOS\//.test(ua)) {
    return {
      name: "Chrome (iOS)",
      version: versionFrom(ua, /CriOS\/([\d.]+)/),
      engine: "WebKit",
    };
  }
  if (/Firefox\//.test(ua)) {
    return {
      name: "Firefox",
      version: versionFrom(ua, /Firefox\/([\d.]+)/),
      engine: "Gecko",
    };
  }
  if (/Chrome\//.test(ua)) {
    return {
      name: "Chrome",
      version: versionFrom(ua, /Chrome\/([\d.]+)/),
      engine: "Blink",
    };
  }
  if (/Version\/[\d.]+.*Safari\//.test(ua)) {
    return {
      name: "Safari",
      version: versionFrom(ua, /Version\/([\d.]+)/),
      engine: "WebKit",
    };
  }

  return { name: "Unknown browser", version: "—", engine: "Unknown" };
}

export function detectOs(): string {
  const ua = navigator.userAgent;
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows/.test(ua)) return "Windows";
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS / iPadOS";
  if (/Android/.test(ua)) return "Android";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown OS";
}

async function batterySignal(): Promise<boolean | null> {
  try {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        charging: boolean;
        level: number;
        dischargingTime: number;
      }>;
    };
    if (typeof nav.getBattery !== "function") return null;
    const battery = await nav.getBattery();
    return (
      battery.charging === false ||
      battery.level < 1 ||
      Number.isFinite(battery.dischargingTime)
    );
  } catch {
    return null;
  }
}

export async function detectDevice(): Promise<DeviceInfo> {
  const ua = navigator.userAgent;
  const nav = navigator as Navigator & { userAgentData?: UADataLike };
  const platform = nav.userAgentData?.platform ?? navigator.platform ?? "";
  const touch = navigator.maxTouchPoints > 0;
  const viewport = Math.min(window.innerWidth, window.innerHeight);

  const isTablet =
    /iPad|Tablet|PlayBook|Silk/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
    (platform === "MacIntel" && touch);

  if (isTablet) {
    return {
      deviceClass: "tablet",
      confidence: "high",
      signals: [
        "tablet user agent / touch Mac",
        `${touch ? "touch" : "no touch"} input`,
        `${viewport}px short edge`,
      ],
    };
  }

  const isMobile = /Android|iPhone|iPod|Mobile|Windows Phone/i.test(ua);
  if (isMobile) {
    return {
      deviceClass: "mobile",
      confidence: "high",
      signals: [
        "mobile user agent",
        `${touch ? "touch" : "no touch"} input`,
        `${viewport}px short edge`,
      ],
    };
  }

  const battery = await batterySignal();
  if (battery === true) {
    return {
      deviceClass: "laptop",
      confidence: "high",
      signals: ["battery reported", "desktop-class user agent"],
    };
  }

  if (/Macintosh|MacIntel|Windows/i.test(platform)) {
    return {
      deviceClass: "laptop",
      confidence: "low",
      signals: [
        "portable OS family",
        battery === null
          ? "battery API unavailable"
          : "battery API inconclusive",
        "form factor may be a desktop",
      ],
    };
  }

  return {
    deviceClass: "desktop",
    confidence: "medium",
    signals: ["desktop-class user agent", "no mobile or tablet markers"],
  };
}

function regionFromLocale(): string | null {
  const locale = navigator.languages?.[0] ?? navigator.language;
  if (!locale) return null;
  try {
    return new Intl.Locale(locale).region ?? null;
  } catch {
    const match = locale.match(/[-_]([A-Za-z]{2})$/);
    return match ? match[1].toUpperCase() : null;
  }
}

function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return code.replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );
}

function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "Unknown";
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code
    );
  } catch {
    return code;
  }
}

export function detectCountry(): CountryInfo {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const mapped = TZ_COUNTRY[timezone];
  const fallback = regionFromLocale();
  const code = mapped ?? fallback ?? "—";
  return {
    code,
    name: countryName(code),
    flag: countryFlag(code),
    timezone,
    source: mapped ? "timezone → country" : "locale region",
  };
}

function webglRenderer(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    if (!gl) return null;
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    if (debug) {
      return String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
    }
    return String(gl.getParameter(gl.RENDERER));
  } catch {
    return null;
  }
}

function runBotChecks(
  device: DeviceInfo,
  country: CountryInfo,
  browser: BrowserInfo
): BotReport {
  const ua = navigator.userAgent;
  const checks: BotCheck[] = [];

  const webdriver = navigator.webdriver === true;
  checks.push({
    id: "webdriver",
    label: "Automation flag",
    status: webdriver ? "fail" : "pass",
    detail: webdriver
      ? "navigator.webdriver is true"
      : "No WebDriver automation flag",
  });

  const automationUa = /headless|phantomjs|selenium|puppeteer|playwright/i.test(
    ua
  );
  checks.push({
    id: "ua",
    label: "Browser signature",
    status: automationUa ? "fail" : "pass",
    detail: automationUa
      ? "User agent contains an automation marker"
      : "No headless or automation marker in the user agent",
  });

  const languages = navigator.languages?.length ?? 0;
  checks.push({
    id: "languages",
    label: "Language surface",
    status: languages === 0 ? "warn" : "pass",
    detail:
      languages === 0
        ? "No navigator.languages entries"
        : (navigator.languages ?? [navigator.language])
            .slice(0, 3)
            .join(", "),
  });

  const cores = navigator.hardwareConcurrency ?? 0;
  checks.push({
    id: "cores",
    label: "CPU concurrency",
    status: cores > 0 && cores <= 1 ? "warn" : "pass",
    detail:
      cores > 0
        ? `${cores} logical core${cores === 1 ? "" : "s"} exposed`
        : "Not exposed by this browser",
  });

  if (browser.engine === "Blink") {
    const plugins = navigator.plugins?.length ?? 0;
    checks.push({
      id: "plugins",
      label: "Plugin surface",
      status: plugins === 0 ? "warn" : "pass",
      detail:
        plugins === 0
          ? "Chromium reported zero plugin entries"
          : `${plugins} plugin entries exposed`,
    });
  }

  const renderer = webglRenderer();
  checks.push({
    id: "webgl",
    label: "Graphics renderer",
    status:
      renderer && /swiftshader|llvmpipe|software/i.test(renderer)
        ? "warn"
        : "pass",
    detail: renderer
      ? renderer.length > 64
        ? `${renderer.slice(0, 64)}…`
        : renderer
      : "WebGL renderer unavailable",
  });

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const expectsFinePointer = device.deviceClass !== "mobile" && device.deviceClass !== "tablet";
  checks.push({
    id: "pointer",
    label: "Pointer consistency",
    status: finePointer === expectsFinePointer ? "pass" : "warn",
    detail: `${finePointer ? "fine" : "coarse"} pointer · ${device.deviceClass} class`,
  });

  const localeRegion = regionFromLocale();
  checks.push({
    id: "locale",
    label: "Locale consistency",
    status:
      country.code &&
      localeRegion &&
      country.code !== "—" &&
      country.code !== localeRegion
        ? "warn"
        : "pass",
    detail: localeRegion
      ? `Locale region ${localeRegion}${country.code !== "—" ? ` · country ${country.code}` : ""}`
      : "Locale region not exposed",
  });

  const penalty = checks.reduce(
    (total, check) =>
      total + (check.status === "fail" ? 40 : check.status === "warn" ? 12 : 0),
    0
  );
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const verdict: BotVerdict =
    score >= 80
      ? "likely_human"
      : score >= 55
        ? "needs_verification"
        : "likely_automated";

  return { score, verdict, checks };
}

export function collectSessionDetails(): SessionDetails {
  const nav = navigator as Navigator & { userAgentData?: UADataLike };
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale:
      (navigator.languages?.[0] ?? navigator.language) +
      (navigator.languages && navigator.languages.length > 1
        ? ` +${navigator.languages.length - 1}`
        : ""),
    platform: nav.userAgentData?.platform ?? navigator.platform ?? "Unknown",
    screen: `${window.screen.width} × ${window.screen.height}`,
    touch: navigator.maxTouchPoints > 0,
    cores: navigator.hardwareConcurrency || null,
  };
}

export async function collectSessionProfile(): Promise<SessionProfile> {
  const browser = await detectBrowser();
  const device = await detectDevice();
  const country = detectCountry();
  return {
    browser,
    device,
    country,
    details: collectSessionDetails(),
    bot: runBotChecks(device, country, browser),
  };
}
