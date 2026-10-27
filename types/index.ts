export type AgeProfile = "all" | "kids" | "teen" | "adult";
export type SettingsSubTab = "account" | "creator" | "security" | "ads";
export type PolicySubTab = "usage" | "refund" | "platform" | "data" | "privacy";
export type ProfileSubTab = "profile" | "session" | "identity" | "data";
export type ShopSubTab = "store" | "orders";
export type StudioSubTab = "dashboard" | "content" | "upload" | "analytics" | "community" | "subtitles" | "customization";
export type AdSubTab = "analytics" | "bids" | "studio" | "payouts";
export type GovernanceSubTab = "claims" | "takedowns" | "complaints";
export type MainTabType =
  | "feed"
  | "subscriptions"
  | "favourites"
  | "history"
  | "channels"
  | "studio"
  | "ads"
  | "collab"
  | "governance"
  | "legal"
  | "microservices"
  | "shop"
  | "profile"
  | "policies"
  | "settings";

export interface CreatorChannel {
  id: string;
  accountId: string;
  name: string;
  handle: string;
  description: string;
  category: string;
  subcategory?: string;
  avatar: string;
  bannerUrl?: string;
  watermarkUrl?: string;
  contactEmail?: string;
  externalLinks?: { title: string; url: string }[];
  subscribersCount: number;
  videosCount: number;
  totalViews: number;
  createdAt: string;
  isPrimary: boolean;
  status: "active" | "verified";
  handleUpdatedAt?: string;
  handleLockedUntil?: string;
  canEditHandle?: boolean;
  daysUntilUnlock?: number;
}

export interface BuyLink {
  id: string;
  title: string;
  url: string;
  price?: string;
  merchant?: string;
  badge?: string;
  image?: string;
}

export type ContentFormatType =
  | "video"
  | "short_video"
  | "audio"
  | "movie"
  | "series"
  | "vertical_series"
  | "pdf"
  | "movie"
  | "web_series"
  | "series"
  | "vertical_series"
  | "manga"
  | "cartoons"
  | "news_video"
  | "digital_newspaper"
  | "music"
  | "sports"
  | "anime"
  | "articles"
  | "gaming"
  | "generic";

/**
 * Standard Platform Categories strictly identical to the Left Navigation Plane.
 * Strictly NO adult, NO doctor, NO gov.
 */
export const PLATFORM_CATEGORIES = [
  "Live Channels",
  "Radio",
  "News Video",
  "Digital Newspaper",
  "Music",
  "Sports",
  "Movies",
  "Web Series",
  "Anime",
  "Manga",
  "Cartoons",
  "Articles",
  "Education",
  "Gaming",
  "Health",
  "Generic",
] as const;

export type PlatformCategory = (typeof PLATFORM_CATEGORIES)[number];

export interface VideoItem {
  id: string;
  /** Owning channel, required for persisted channel-subscription actions. */
  channelId?: string;
  catalogCode?: string;
  title: string;
  description: string;
  duration: string;
  durationSec: number;
  thumbnail: string;
  videoUrl: string;
  ageProfile: AgeProfile;
  category: string;
  contentType?: ContentFormatType;
  privacy?: "public" | "private" | "unlisted";
  filmCertification?: string;
  certificateDoc?: string;
  sportsTournament?: string;
  sportsSchedule?: string;
  sportsResult?: string;
  mediaDocUrl?: string;
  seriesEpisode?: {
    id?: string;
    seriesName: string;
    seasonNumber: number;
    episodeNumber: number;
    episodeTitle?: string;
  };
  uploader: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  views: number;
  publishedDate: string;
  status: "published" | "transcoding" | "draft" | "review";
  adSettings: {
    monetizationEnabled: boolean;
    preRoll: boolean;
    midRoll: boolean;
    bannerAd: boolean;
    impressions: number;
    revenue: number; // in INR
    cpm: number;
  };
  tags: string[];
  publicDomainLicense: string;
  likes?: number;
  isSubscribed?: boolean;
  trendingRank?: number;
  similarityScore?: number;
  matchPercentage?: number;
  buyLinks?: BuyLink[];
}

export interface AdSimulation {
  id: string;
  advertiser: string;
  title: string;
  tagline: string;
  ctaText: string;
  ctaUrl: string;
  durationSec: number;
  skipAfterSec: number;
  bannerUrl: string;
  targetProfile: "kids" | "teen" | "adult" | "all";
  cpm?: number;
  badge?: string;
  rating?: number;
  logoUrl?: string;
  trackingToken?: string;
  impressionUrl?: string;
  clickUrl?: string;
}

export type ShopCategory = "merch" | "digital" | "learning";

export interface ShopProduct {
  id: string;
  name: string;
  seller: string;
  category: ShopCategory;
  price: number;
  mrp?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  format: string;
  createdAt?: string;
}

export interface ShopOrder {
  id: string;
  userId?: string;
  date?: string;
  createdAt?: string;
  total: number;
  status: "delivered" | "shipped" | "processing" | "cancelled";
  items: { name: string; image?: string; qty: number; price?: number }[];
}
