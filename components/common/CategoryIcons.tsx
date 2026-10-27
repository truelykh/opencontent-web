import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

/**
 * A compact leaf-and-spiral Anime emblem. It echoes the supplied reference
 * without an enclosing badge, so it stays visually consistent with the other
 * single-size navigation glyphs.
 */
export function AnimeBladeIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M2.15 19.5 5.7 8.2A8.4 8.4 0 0 1 18.85 4l2.98-2.33 1.17 1.5-4.22 3.3A8.42 8.42 0 1 1 5.16 17.1l-.75 2.4H2.15Zm5.5-10.7-.43 1.36a6.22 6.22 0 1 0 9.96-2.9l-1.62 1.27a4.15 4.15 0 1 1-6.69 2.22l-1.2-1.95Zm4.63 2.46a2.1 2.1 0 1 0 1.77 3.22l-1.15-.9.99-1.25a2.1 2.1 0 0 0-1.61-1.07Z" />
    </SvgIcon>
  );
}

/** A simple cat-face mark for Cartoons. */
export function CartoonCatIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M5 5.1 8.1 7A8.3 8.3 0 0 1 12 6c1.4 0 2.7.4 3.9 1L19 5.1v5.6A7 7 0 0 1 19 12c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-.5.1-.9.1-1.3V5.1Zm3.4 7.4a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm7.2 0a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2ZM10 14.2c.5.5 1.1.8 2 .8s1.5-.3 2-.8l-2-1.1-2 1.1Z" />
    </SvgIcon>
  );
}

/** A standalone flame/drop mark for Trending; intentionally no enclosing ring. */
export function TrendingCometIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M18.5 3.4c-4.3 1.1-8.4 3.3-10.9 6.3C5.8 11.9 5 14.4 5 16.6A4.6 4.6 0 0 0 9.6 21c2.2 0 4.7-.8 6.9-2.7 3-2.5 5.2-6.6 6.1-10.9l-5.3 3.1.1-7.1ZM9.6 18.2a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6Z" />
    </SvgIcon>
  );
}
