import {
  AccountBalanceRounded as Gov,
  AutoAwesomeRounded as AutoAwesome,
  ArticleRounded as Article,
  BarChartRounded as BarChart,
  ArticleRounded as FileText,
  CampaignRounded as Campaign,
  ChildCareRounded as ChildCare,
  CodeRounded as Code,
  CurrencyRupeeRounded as CurrencyRupee,
  EventRounded as Event,
  GroupsRounded as Groups,
  HeadphonesRounded as Headphones,
  HomeWorkRounded as HomeWork,
  Inventory2Rounded as Inventory,
  LibraryBooksRounded as LibraryBooks,
  MicRounded as Mic,
  MenuBookRounded as BookOpen,
  FavoriteBorderRounded as Heart,
  FolderOpenRounded as FolderOpen,
  ExploreRounded as Explore,
  HealthAndSafetyRounded as Health,
  HomeRounded as Home,
  PersonRounded as Profile,
  HelpOutlineRounded as Help,
  LiveTvRounded as Tv,
  MenuBookRounded as Newspaper,
  MusicNoteRounded as Music,
  RadioRounded as Radio,
  ScienceRounded as Science,
  ShoppingBagRounded as ShoppingBag,
  SchoolRounded as GraduationCap,
  TranslateRounded as Translate,
  SportsEsportsRounded as Gaming,
  TrendingUpRounded as TrendingUp,
  UploadFileRounded as UploadFile,
  VideoLibraryRounded as VideoLibrary,
  VideoSettingsRounded as VideoSettings,
  HistoryRounded as History,
  CloudUploadRounded as Upload,
  SettingsRounded as Settings,
} from "@mui/icons-material";
import type { NavIconType } from "@/components/layout/NavItem";
import { SIDEBAR_CATEGORY_ITEMS } from "@/components/layout/sidebarCategories";
import { AnimeBladeIcon, CartoonCatIcon } from "@/components/common/CategoryIcons";

export interface PrimaryNavigationItem {
  id: "home" | "explore" | "trending" | "live";
  label: string;
  icon: NavIconType;
}

export interface LibraryNavigationItem {
  id: "subscriptions" | "favourites" | "history";
  label: string;
  icon: NavIconType;
  tab: string;
}

export type ExploreDestinationTarget =
  | { type: "category"; category: string }
  | { type: "tab"; tab: string }
  | { type: "shop"; subTab: "store" | "orders" }
  | { type: "upload" };

export type ExploreDestinationAvailability =
  | "supported"
  | "filter-backed"
  | "planned"
  | "policy-restricted";

export type ExploreGroupPresentation = "directory" | "product";

export interface ExploreDestination {
  id: string;
  label: string;
  description: string;
  icon: NavIconType;
  availability: ExploreDestinationAvailability;
  target?: ExploreDestinationTarget;
}

export interface ExploreGroup {
  id: string;
  title: string;
  description: string;
  icon: NavIconType;
  presentation: ExploreGroupPresentation;
  previewDestinationIds: readonly string[];
  selectionTitle: string;
  selectionDescription: string;
  destinations: readonly ExploreDestination[];
}

export const PRIMARY_NAVIGATION: readonly PrimaryNavigationItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "explore", label: "Explore", icon: Explore },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "live", label: "Live", icon: Tv },
];

export interface SidebarProductNavigationItem {
  id: "shop" | "studio" | "adcenter";
  label: string;
  icon: NavIconType;
  tab: string;
  external: boolean;
}

export const SIDEBAR_PRODUCT_NAVIGATION: readonly SidebarProductNavigationItem[] = [
  { id: "shop", label: "Shop", icon: ShoppingBag, tab: "shop", external: false },
  { id: "studio", label: "Studio", icon: VideoSettings, tab: "studio", external: true },
  { id: "adcenter", label: "Adcentre", icon: Campaign, tab: "ads", external: true },
];

export interface SidebarSecondaryNavigationItem {
  id: "profile" | "settings" | "help";
  label: string;
  icon: NavIconType;
  tab: string;
}

export const SIDEBAR_SECONDARY_NAVIGATION: readonly SidebarSecondaryNavigationItem[] = [
  { id: "profile", label: "Profile", icon: Profile, tab: "profile" },
  { id: "settings", label: "Settings", icon: Settings, tab: "settings" },
  { id: "help", label: "Help", icon: Help, tab: "policies" },
];

export const LIBRARY_NAVIGATION: readonly LibraryNavigationItem[] = [
  { id: "subscriptions", label: "Subscriptions", icon: Tv, tab: "subscriptions" },
  { id: "favourites", label: "Favourites", icon: Heart, tab: "favourites" },
  { id: "history", label: "Watch History", icon: History, tab: "history" },
];

const categoryDestination = (
  id: string,
  label: string,
  description: string,
  icon: NavIconType,
  category = id,
  availability: ExploreDestinationAvailability = "supported",
): ExploreDestination => ({
  id,
  label,
  description,
  icon,
  availability,
  target: { type: "category", category },
});

const plannedDestination = (
  id: string,
  label: string,
  icon: NavIconType,
  availability: Extract<ExploreDestinationAvailability, "planned" | "policy-restricted"> = "planned",
): ExploreDestination => ({
  id,
  label,
  description: availability === "policy-restricted" ? "Available after audience-policy approval." : "Coming soon.",
  icon,
  availability,
});

const appDestination = (
  id: string,
  label: string,
  description: string,
  icon: NavIconType,
  target: ExploreDestinationTarget,
): ExploreDestination => ({ id, label, description, icon, availability: "supported", target });

export const EXPLORE_GROUPS: readonly ExploreGroup[] = [
  {
    id: "watch",
    title: "Watch",
    description: "Video and entertainment from the public catalogue.",
    icon: VideoLibrary,
    presentation: "directory",
    previewDestinationIds: ["videos", "Movies", "Web Series", "short-drama", "Sports", "short-videos", "kids"],
    selectionTitle: "What would you like to watch?",
    selectionDescription: "Choose a content format.",
    destinations: [
      plannedDestination("videos", "Videos", VideoLibrary),
      categoryDestination("Movies", "Movies", "Browse movies content.", SIDEBAR_CATEGORY_ITEMS.find((item) => item.id === "Movies")!.icon),
      categoryDestination("Web Series", "Web Series", "Browse web series content.", SIDEBAR_CATEGORY_ITEMS.find((item) => item.id === "Web Series")!.icon),
      plannedDestination("short-drama", "Short Drama", VideoLibrary),
      plannedDestination("short-videos", "Shorts", VideoLibrary),
      categoryDestination("vertical-ai-series", "Vertical AI Series", "Browse vertical series content.", AutoAwesome, "Vertical AI Series", "filter-backed"),
      plannedDestination("documentaries", "Documentaries", FileText),
      categoryDestination("Sports", "Sports", "Browse sports content.", SIDEBAR_CATEGORY_ITEMS.find((item) => item.id === "Sports")!.icon),
      categoryDestination("Gaming", "Gaming", "Browse gaming content.", SIDEBAR_CATEGORY_ITEMS.find((item) => item.id === "Gaming")!.icon),
      categoryDestination("Anime", "Anime", "Browse anime content.", AnimeBladeIcon),
      categoryDestination("Cartoons", "Cartoons", "Browse cartoons content.", CartoonCatIcon),
      plannedDestination("kids", "Kids", ChildCare, "policy-restricted"),
    ],
  },
  {
    id: "listen",
    title: "Listen",
    description: "Audio and live listening experiences already available in the catalogue.",
    icon: Headphones,
    presentation: "directory",
    previewDestinationIds: ["Music", "podcasts", "Radio"],
    selectionTitle: "What would you like to listen to?",
    selectionDescription: "Explore music, spoken audio, and radio.",
    destinations: [
      categoryDestination("Music", "Music", "Browse music releases and performances.", Music),
      plannedDestination("podcasts", "Podcasts", Mic),
      plannedDestination("audiobooks", "Audiobooks", BookOpen),
      categoryDestination("Radio", "Radio", "Browse radio content when it is available.", Radio),
      plannedDestination("audio-stories", "Audio Stories", Headphones),
      plannedDestination("interviews", "Interviews", Mic),
      plannedDestination("lectures", "Lectures", GraduationCap),
      plannedDestination("live-audio", "Live Audio", Radio),
    ],
  },
  {
    id: "read",
    title: "Read",
    description: "Articles, manga, and newspaper content from existing categories.",
    icon: BookOpen,
    presentation: "directory",
    previewDestinationIds: ["Articles", "books", "newspapers", "Manga", "research-papers"],
    selectionTitle: "What would you like to read?",
    selectionDescription: "Explore publications, books, and written content.",
    destinations: [
      categoryDestination("Articles", "Articles", "Browse long-form articles.", FileText),
      plannedDestination("books", "Books", LibraryBooks),
      plannedDestination("ebooks", "E-Books", BookOpen),
      plannedDestination("newspapers", "Newspapers", Newspaper),
      plannedDestination("magazines", "Magazines", LibraryBooks),
      categoryDestination("Manga", "Manga", "Browse manga content.", BookOpen),
      plannedDestination("comics", "Comics", BookOpen),
      plannedDestination("research-papers", "Research Papers", Science),
      plannedDestination("presentations", "Presentations", FileText),
      plannedDestination("reports", "Reports", FileText),
      plannedDestination("journals", "Journals", LibraryBooks),
      plannedDestination("guides", "Guides", BookOpen),
      categoryDestination("Digital Newspaper", "Digital Newspaper", "Browse digital newspaper editions.", Newspaper),
    ],
  },
  {
    id: "learn",
    title: "Learn",
    description: "Education content from the existing catalogue.",
    icon: GraduationCap,
    presentation: "directory",
    previewDestinationIds: ["educational-videos", "learn-books", "learn-research-papers", "pdfs", "presentations-ppt"],
    selectionTitle: "What would you like to learn?",
    selectionDescription: "Discover knowledge, courses, and educational resources.",
    destinations: [
      plannedDestination("courses", "Courses", GraduationCap),
      plannedDestination("tutorials", "Tutorials", VideoLibrary),
      plannedDestination("educational-videos", "Educational Videos", VideoLibrary),
      plannedDestination("learn-books", "Books", BookOpen),
      plannedDestination("learn-research-papers", "Research Papers", Science),
      plannedDestination("pdfs", "PDFs", FileText),
      plannedDestination("presentations-ppt", "Presentations (PPT)", FileText),
      plannedDestination("video-lessons", "Video Lessons", VideoLibrary),
      plannedDestination("study-materials", "Study Materials", BookOpen),
      plannedDestination("exam-preparation", "Exam Preparation", FileText),
      plannedDestination("skill-development", "Skill Development", AutoAwesome),
      plannedDestination("language-learning", "Language Learning", Translate),
      plannedDestination("coding-technology", "Coding & Technology", Code),
      plannedDestination("science", "Science", Science),
      plannedDestination("workshops", "Workshops", Groups),
      categoryDestination("Education", "Education", "Browse educational content.", GraduationCap),
    ],
  },
  {
    id: "live",
    title: "Live",
    description: "Live channels and broadcasts from the existing catalogue.",
    icon: Tv,
    presentation: "directory",
    previewDestinationIds: ["Live Channels", "internet-channels", "live-events"],
    selectionTitle: "What would you like to explore live?",
    selectionDescription: "Discover broadcasts and real-time experiences.",
    destinations: [
      categoryDestination("Live Channels", "TV Channels", "Browse live channels when broadcasts are available.", Tv),
      plannedDestination("internet-channels", "Internet Channels", VideoLibrary),
      plannedDestination("live-events", "Live Events", Event),
      plannedDestination("live-sports", "Live Sports", Gaming),
      plannedDestination("live-news", "Live News", FileText),
      plannedDestination("creator-livestreams", "Creator Livestreams", VideoLibrary),
      plannedDestination("live-gaming", "Live Gaming", Gaming),
      plannedDestination("concerts", "Concerts", Music),
      plannedDestination("conferences", "Conferences", Groups),
      plannedDestination("webinars", "Webinars", GraduationCap),
    ],
  },
  {
    id: "public-information",
    title: "Public information",
    description: "Government and health information categories.",
    icon: Gov,
    presentation: "directory",
    previewDestinationIds: ["Gov", "Health", "public-notices", "public-services"],
    selectionTitle: "What information are you looking for?",
    selectionDescription: "Explore public information and useful resources.",
    destinations: [
      categoryDestination("Gov", "Government", "Browse government publications when available.", Gov),
      categoryDestination("Health", "Health", "Browse health information when available.", Health),
      plannedDestination("public-notices", "Public Notices", Article),
      plannedDestination("public-services", "Public Services", HomeWork),
    ],
  },
  {
    id: "commerce",
    title: "Shop",
    description: "Commerce workflows already supported by Openstore.",
    icon: ShoppingBag,
    presentation: "directory",
    previewDestinationIds: ["marketplace", "orders", "order-tracking", "returns", "refunds"],
    selectionTitle: "What would you like to shop for?",
    selectionDescription: "Explore products and the OpenContent marketplace.",
    destinations: [
      appDestination("marketplace", "Marketplace", "Browse products available in Openstore.", ShoppingBag, { type: "shop", subTab: "store" }),
      plannedDestination("physical-products", "Physical Products", Inventory),
      plannedDestination("digital-products", "Digital Products", UploadFile),
      plannedDestination("books-media", "Books & Media", LibraryBooks),
      plannedDestination("electronics", "Electronics", VideoSettings),
      plannedDestination("fashion", "Fashion", ShoppingBag),
      plannedDestination("home-living", "Home & Living", HomeWork),
      plannedDestination("creator-merchandise", "Creator Merchandise", ShoppingBag),
      appDestination("orders", "My Orders", "Review your existing orders.", FolderOpen, { type: "shop", subTab: "orders" }),
      plannedDestination("order-tracking", "Order Tracking", History),
      plannedDestination("returns", "Returns", FolderOpen),
      plannedDestination("refunds", "Refunds", CurrencyRupee),
      plannedDestination("product-categories", "Product Categories", Inventory),
      plannedDestination("wishlist", "Wishlist", Heart),
      plannedDestination("shopping-cart", "Shopping Cart", ShoppingBag),
      plannedDestination("checkout", "Checkout", ShoppingBag),
      plannedDestination("addresses", "Addresses", HomeWork),
      plannedDestination("payment-methods", "Payment Methods", CurrencyRupee),
      plannedDestination("order-support", "Order Support", Headphones),
    ],
  },
  {
    id: "create",
    title: "Studio",
    description: "Open the creator workspace and manage your content.",
    icon: VideoSettings,
    presentation: "product",
    previewDestinationIds: ["creator-studio"],
    selectionTitle: "What would you like to create?",
    selectionDescription: "Manage your content and creator tools.",
    destinations: [
      appDestination("creator-studio", "Creator Studio", "Open the existing creator workspace.", VideoSettings, { type: "tab", tab: "studio" }),
      appDestination("upload-content", "Upload Content", "Open the existing upload workflow.", Upload, { type: "upload" }),
      appDestination("my-channel", "My Channel", "Manage creator channels.", Tv, { type: "tab", tab: "channels" }),
      plannedDestination("my-content", "My Content", VideoLibrary),
      plannedDestination("analytics", "Analytics", BarChart),
      plannedDestination("collaborations", "Collaborations", Groups),
      plannedDestination("monetization", "Monetization", CurrencyRupee),
    ],
  },
  {
    id: "advertise",
    title: "Advertise",
    description: "Manage supported advertising workflows in Adcentre.",
    icon: TrendingUp,
    presentation: "product",
    previewDestinationIds: ["adcentre"],
    selectionTitle: "What would you like to manage?",
    selectionDescription: "Explore advertising and campaign tools.",
    destinations: [
      appDestination("adcentre", "Adcentre", "Open the existing advertising workspace.", TrendingUp, { type: "tab", tab: "ads" }),
      plannedDestination("campaigns", "Campaigns", Campaign),
      plannedDestination("creative-assets", "Creative Assets", AutoAwesome),
      plannedDestination("performance-reports", "Performance Reports", BarChart),
    ],
  },
];

export type ExploreGroupId = (typeof EXPLORE_GROUPS)[number]["id"];

/**
 * The legacy Others category remains a valid internal filter, but is not a
 * primary Explore group until it has a clearer user-facing taxonomy.
 */
export const LEGACY_CATEGORY_IDS = ["Others"] as const;

export const HOME_DISCOVERY_GROUP_IDS = {
  watch: "watch",
  listen: "listen",
  read: "read",
  learn: "learn",
  live: "live",
  shop: "commerce",
  create: "create",
} as const satisfies Record<"watch" | "listen" | "read" | "learn" | "live" | "shop" | "create", ExploreGroupId>;

export const MORE_NAVIGATION = [
  { id: "settings", label: "Settings", icon: Settings, tab: "settings" },
  { id: "policies", label: "Policies", icon: FileText, tab: "policies" },
  { id: "legal", label: "Legal-first Spec", icon: FileText, tab: "legal" },
  { id: "microservices", label: "Runtime Topology", icon: FolderOpen, tab: "microservices" },
] as const;
