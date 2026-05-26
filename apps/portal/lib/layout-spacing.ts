/**
 * Layout spacing tokens (Tailwind default scale: 1 unit = 0.25rem / 4px).
 *
 * - Below sticky header: pt-8 / pt-10 (32px / 40px) — comfortable, not flush
 * - Section rhythm: py-12 / py-16 (48px / 64px) — inner marketing pages
 * - Page title → content: mb-8 (32px)
 *
 * @see https://tailwindcss.com/docs/customizing-spacing
 */

/** Sticky site header inner bar height */
export const siteHeaderHeightClass = "h-16";

/** Keeps header chrome and in-header menus above page content. */
export const siteHeaderStackClass = "sticky top-0 z-[100] isolate";

/** Gap between sticky header and first page content */
export const sectionBelowHeaderClass = "pt-8 sm:pt-10";

/** Stack on the previous block without extra top padding */
export const sectionTightTopClass = "pt-0 sm:pt-0";

/** Default vertical padding for marketing sections */
export const sectionPaddingYClass = "py-12 sm:py-16";

/** Space under a page title block before the next element */
export const pageTitleSpacingClass = "mb-8";

/** Gap between sticky header (h-16) and page content — non-marketing layouts */
export const mainBelowHeaderClass = "pt-6 sm:pt-8";

/** Sticky sidebar offset: header (4rem) + main top padding (1.5–2rem) */
export const stickyBelowHeaderClass = "top-20 sm:top-[5.5rem]";
