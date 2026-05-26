"use client";

import { useTranslations } from "next-intl";
import { Check, ChevronDown, Languages } from "lucide-react";
import { localeCodes, type Locale } from "@/lib/i18n/locale-config";
import { useSwitchLocale } from "@/lib/i18n/use-switch-locale";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  className?: string;
  /**
   * `menu` — dropdown trigger for headers.
   * `select` — full-width native select (settings).
   * `grid` — two-column language cards (marketing mobile menu).
   */
  variant?: "menu" | "select" | "grid";
  /**
   * `default` — globe + full language name on the trigger.
   * `toolbar` — icon-only on narrow headers; short code from `sm`; full name from `lg`.
   */
  size?: "default" | "toolbar";
  /** Polished styles for the public marketing site header and mobile drawer. */
  appearance?: "default" | "marketing";
};

const popoverLayerClassName = "z-[200]";

const menuContentClassName = cn(popoverLayerClassName, "min-w-44 bg-white dark:bg-slate-950");

const marketingMenuContentClassName = cn(
  popoverLayerClassName,
  "w-60 rounded-2xl border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-950",
);

const marketingRadioItemClassName =
  "rounded-lg py-2.5 pl-8 text-slate-700 focus:bg-emerald-50 focus:text-emerald-900 data-[state=checked]:bg-emerald-50 data-[state=checked]:text-emerald-900 dark:text-slate-200 dark:focus:bg-emerald-950/50 dark:focus:text-emerald-300 dark:data-[state=checked]:bg-emerald-950/40 dark:data-[state=checked]:text-emerald-300";

function localeShortCode(locale: Locale): string {
  if (locale === "de-AT") return "AT";
  const base = locale.split("-")[0];
  return base.toUpperCase();
}

function LocaleMenuPlaceholder({
  className,
  label,
  localeLabel,
  size = "default",
  appearance = "default",
}: {
  className?: string;
  label: string;
  localeLabel: string;
  size?: "default" | "toolbar";
  appearance?: "default" | "marketing";
}) {
  const isMarketing = appearance === "marketing";

  return (
    <Button
      type="button"
      variant={isMarketing ? "ghost" : "outline"}
      size={size === "toolbar" ? "icon-sm" : "sm"}
      className={cn(
        isMarketing
          ? "rounded-full px-3 text-slate-600"
          : size === "toolbar"
            ? "size-8 shrink-0 rounded-full sm:size-auto sm:gap-1.5 sm:px-3"
            : "rounded-full gap-1.5",
        className,
      )}
      aria-label={label}
      aria-haspopup="menu"
      disabled
    >
      <Languages
        data-icon={size === "default" && !isMarketing ? "inline-start" : undefined}
        className={cn(
          "size-4 shrink-0",
          isMarketing && "text-slate-500 dark:text-slate-400",
        )}
        aria-hidden
      />
      {size === "default" ? (
        <span className="max-w-[7rem] truncate">{localeLabel}</span>
      ) : isMarketing ? (
        <span className="font-medium tabular-nums">{localeLabel}</span>
      ) : (
        <span className="hidden max-w-[4rem] truncate sm:inline lg:hidden">
          {localeLabel}
        </span>
      )}
      {isMarketing ? <ChevronDown className="size-3.5 opacity-50" aria-hidden /> : null}
    </Button>
  );
}

function LocaleGrid({
  className,
  appearance = "default",
  isPending = false,
}: {
  className?: string;
  appearance?: "default" | "marketing";
  isPending?: boolean;
}) {
  const { switchLocale, locale } = useSwitchLocale();
  const t = useTranslations("LocaleSwitcher");
  const isMarketing = appearance === "marketing";

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2",
        isMarketing &&
          "rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80",
        className,
      )}
      role="listbox"
      aria-label={t("label")}
    >
      {isMarketing ? (
        <p className="col-span-2 mb-1 px-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t("label")}
        </p>
      ) : null}
      {localeCodes.map((code) => {
        const selected = locale === code;
        return (
          <button
            key={code}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={isPending}
            onClick={() => switchLocale(code)}
            className={cn(
              "relative rounded-xl border px-3 py-2.5 text-left transition-all disabled:opacity-60",
              selected
                ? "border-emerald-300/80 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-200/80 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800/60"
                : "border-slate-200/80 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30",
            )}
          >
            {selected ? (
              <Check
                className="absolute right-2 top-2 size-3.5 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
            ) : null}
            <span className="block text-sm font-semibold tabular-nums">
              {localeShortCode(code)}
            </span>
            <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
              {t(code)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Site-wide language control. Use this instead of custom locale pickers. */
export function LocaleSwitcher({
  className,
  variant = "menu",
  size = "default",
  appearance = "default",
}: LocaleSwitcherProps) {
  const { switchLocale, isPending, locale } = useSwitchLocale();
  const t = useTranslations("LocaleSwitcher");
  const isClient = useIsClient();
  const shortCode = localeShortCode(locale);
  const isMarketing = appearance === "marketing";
  const pendingClass = isPending ? "pointer-events-none opacity-60" : undefined;

  if (variant === "grid") {
    if (!isClient) {
      return (
        <div
          className={cn(
            "grid h-32 grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80",
            className,
          )}
          aria-hidden
        />
      );
    }
    return (
      <LocaleGrid
        className={cn(pendingClass, className)}
        appearance={appearance}
        isPending={isPending}
      />
    );
  }

  if (variant === "select") {
    if (!isClient) {
      return (
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-between font-normal", className)}
          aria-label={t("label")}
          disabled
        >
          <span>{t(locale)}</span>
        </Button>
      );
    }

    return (
      <Select
        value={locale}
        disabled={isPending}
        onValueChange={(next) => switchLocale(next as Locale)}
      >
        <SelectTrigger
          className={cn(
            pendingClass,
            isMarketing &&
              "h-11 rounded-xl border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/80",
            className,
          )}
          aria-label={t("label")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" className={cn(popoverLayerClassName, "rounded-xl")}>
          <SelectGroup>
            {localeCodes.map((code) => (
              <SelectItem key={code} value={code}>
                {t(code)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  if (!isClient) {
    return (
      <LocaleMenuPlaceholder
        className={className}
        label={t("label")}
        localeLabel={
          isMarketing || size === "toolbar" ? shortCode : t(locale)
        }
        size={isMarketing ? "toolbar" : size}
        appearance={appearance}
      />
    );
  }

  const triggerClassName = cn(
    pendingClass,
    isMarketing
      ? "h-9 shrink-0 gap-1.5 rounded-full px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      : size === "toolbar"
        ? "size-8 shrink-0 rounded-full p-0 sm:size-auto sm:gap-1.5 sm:px-3"
        : "rounded-full gap-1.5",
    className,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isMarketing ? "ghost" : "outline"}
          size={size === "toolbar" || isMarketing ? "sm" : "sm"}
          className={triggerClassName}
          aria-label={t("label")}
        >
          <Languages
            data-icon={size === "default" && !isMarketing ? "inline-start" : undefined}
            className={cn(
              "size-4 shrink-0",
              isMarketing && "text-slate-500 dark:text-slate-400",
            )}
          />
          {isMarketing ? (
            <>
              <span className="font-medium tabular-nums xl:hidden">{shortCode}</span>
              <span className="hidden max-w-[8rem] truncate font-medium xl:inline">
                {t(locale)}
              </span>
              <ChevronDown className="size-3.5 opacity-50" aria-hidden />
            </>
          ) : size === "default" ? (
            <span className="max-w-[7rem] truncate">{t(locale)}</span>
          ) : (
            <>
              <span className="hidden max-w-[4rem] truncate sm:inline lg:hidden">
                {shortCode}
              </span>
              <span className="hidden max-w-[7rem] truncate lg:inline">
                {t(locale)}
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={isMarketing ? 10 : 8}
        collisionPadding={12}
        className={isMarketing ? marketingMenuContentClassName : menuContentClassName}
      >
        <DropdownMenuLabel
          className={cn(
            isMarketing &&
              "px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
          )}
        >
          {t("label")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={isMarketing ? "my-1" : undefined} />
        <DropdownMenuGroup className={isMarketing ? "p-0.5" : undefined}>
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={(next) => switchLocale(next as Locale)}
          >
            {localeCodes.map((code) => (
              <DropdownMenuRadioItem
                key={code}
                value={code}
                className={isMarketing ? marketingRadioItemClassName : undefined}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span>{t(code)}</span>
                  {isMarketing ? (
                    <span className="text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500">
                      {localeShortCode(code)}
                    </span>
                  ) : null}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
