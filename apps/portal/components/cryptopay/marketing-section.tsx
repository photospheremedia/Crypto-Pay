import { cn } from "@/lib/utils";
import {
  pageTitleSpacingClass,
  sectionBelowHeaderClass,
  sectionPaddingYClass,
  sectionTightTopClass,
} from "@/lib/layout-spacing";

export { CtaButton } from "./cta-button";

/** Wrapper for marketing pages that do not use `<Section>` blocks (about, contact, legal). */
export function MarketingPageShell({
  children,
  className,
  narrow = false,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <section className={cn(sectionBelowHeaderClass, "pb-12 sm:pb-16", className)}>
      <div
        className={cn(
          "mx-auto px-4 sm:px-6",
          narrow ? "max-w-4xl" : "max-w-6xl",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function Section({
  children,
  className,
  id,
  belowHeader,
  tightTop,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** First content block under the site header. */
  belowHeader?: boolean;
  /** Continues the previous section (no extra top padding). */
  tightTop?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        belowHeader && cn(sectionBelowHeaderClass, "pb-12 sm:pb-16"),
        tightTop && cn(sectionTightTopClass, "pb-12 sm:pb-16"),
        !belowHeader && !tightTop && sectionPaddingYClass,
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        pageTitleSpacingClass,
        "max-w-2xl",
        center && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{description}</p>
      )}
    </div>
  );
}
