import {
  AccountBalanceRounded as Gov,
  HealthAndSafetyRounded as Health,
  MovieRounded as Film,
  TvRounded as Tv,
  SportsEsportsRounded as Gamepad2,
  MusicNoteRounded as Music,
  EmojiEventsRounded as Trophy,
  MenuBookRounded as BookOpen,
  ArticleRounded as FileText,
  NewspaperRounded as Newspaper,
  SchoolRounded as GraduationCap,
  HeadphonesRounded as Headphones,
  RadioRounded as Radio,
  FolderOpenRounded as FolderOpen,
} from "@mui/icons-material";
import type { NavIconType } from "./NavItem";
import { AnimeBladeIcon, CartoonCatIcon } from "../common/CategoryIcons";

export interface CategoryNavItem {
  id: string;
  name: string;
  icon: NavIconType;
}

/**
 * Standard Platform Categories strictly identical to the Left Navigation Plane.
 * Restricted creator categories are not offered to channel creation, while the
 * public catalogue may still surface verified government publications.
 * Zero hardcoded mock metrics.
 */
export const SIDEBAR_CATEGORY_ITEMS: CategoryNavItem[] = [
  { id: "Gov", name: "Gov", icon: Gov },
  { id: "Health", name: "Health", icon: Health },
  { id: "Movies", name: "Movies", icon: Film },
  { id: "Web Series", name: "Web Series", icon: Tv },
  { id: "Gaming", name: "Gaming", icon: Gamepad2 },
  { id: "Anime", name: "Anime", icon: AnimeBladeIcon },
  { id: "Cartoons", name: "Cartoons", icon: CartoonCatIcon },
  { id: "Music", name: "Music", icon: Music },
  { id: "Sports", name: "Sports", icon: Trophy },
  { id: "Manga", name: "Manga", icon: BookOpen },
  { id: "Articles", name: "Articles", icon: FileText },
  { id: "Digital Newspaper", name: "Digital Newspaper", icon: Newspaper },
  { id: "Education", name: "Education", icon: GraduationCap },
  { id: "Radio", name: "Radio", icon: Headphones },
  { id: "Live Channels", name: "Live Channels", icon: Radio },
  { id: "Others", name: "Others", icon: FolderOpen },
];
