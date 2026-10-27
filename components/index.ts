/**
 * Opencontent UI Component Registry
 * Centralized exports organized by architectural layer:
 * - layout: Shell, header, sidebar, brand, navigation
 * - video: Players, cards, upload modal, shelves, ad carousel
 * - auth: Profile provider, sign-in modal
 * - views: Tab-level full page panels
 */

// 1. Layout & Shell
export * from "./layout/BrandLogo";
export * from "./layout/NavItem";
export * from "./layout/NavSection";
export * from "./layout/sidebarCategories";
export { default as Header } from "./layout/Header";
export { default as Sidebar } from "./layout/Sidebar";
export { default as SiteFooter } from "./layout/SiteFooter";
export { PrimaryNavigation } from "./layout/PrimaryNavigation";
export { LibrarySection } from "./layout/sidebarSections/LibrarySection";
export { MoreSection } from "./layout/sidebarSections/MoreSection";

// 2. Video & Media
export { default as VideoCard } from "./video/VideoCard";
export { default as VideoPlayerModal } from "./video/VideoPlayerModal";
export { default as VideoUploadModal } from "./video/VideoUploadModal";
export { default as Shelf } from "./video/Shelf";
export type { ShelfTone } from "./video/Shelf";
export { default as VideoTable } from "./video/VideoTable";
export { default as HomeAdCarousel, HomeAdCarouselSkeleton } from "./video/HomeAdCarousel";
export { default as ExploreView } from "./views/ExploreView";
export { default as HomeEmptyState } from "./views/HomeEmptyState";
export { default as TrendingView } from "./views/TrendingView";
export { default as DiscoveryTile } from "./views/DiscoveryTile";
export { default as OpenContentOrbit } from "./home/OpenContentOrbit";

// 3. Auth & Identity
export * from "./auth/ProfileProvider";
export { default as SignInModal } from "./auth/SignInModal";

// 4. Section Views
export { default as OpencontentStudioView } from "./views/OpencontentStudioView";
export { default as ChannelCustomizationView } from "./views/ChannelCustomizationView";
export { default as StudioWelcomeModal } from "./views/StudioWelcomeModal";
export { default as HowYoullAppearModal } from "./views/HowYoullAppearModal";
export { default as ChannelsView } from "./views/ChannelsView";
export { default as SubscriptionsView } from "./views/SubscriptionsView";
export { default as WatchHistoryView } from "./views/WatchHistoryView";
export { default as FavouritesView } from "./views/FavouritesView";
export { default as CreatorCollabView } from "./views/CreatorCollabView";
export { default as CreatorRightsPanel } from "./views/CreatorRightsPanel";
export { default as AdMonetizationPanel } from "./views/AdMonetizationPanel";
export { default as PrivacyProfileView } from "./views/PrivacyProfileView";
export { default as SettingsView } from "./views/SettingsView";
export { default as ShopView } from "./views/ShopView";
export { default as PoliciesView } from "./views/PoliciesView";
export { default as LegalFirstSpecView } from "./views/LegalFirstSpecView";
export { default as MicroserviceArchitectureView } from "./views/MicroserviceArchitectureView";
export { default as ComponentErrorBoundary } from "./common/ErrorBoundary";
export { default as EmptyState } from "./common/EmptyState";
export { default as PageHeading } from "./common/PageHeading";
export { default as HorizontalPageHeader } from "./common/HorizontalPageHeader";
export { default as ContentEmptyState } from "./common/ContentEmptyState";
export { default as ContentErrorState } from "./common/ContentErrorState";
export { default as ContentLoadingState } from "./common/ContentLoadingState";
export * from "./skeletons";
