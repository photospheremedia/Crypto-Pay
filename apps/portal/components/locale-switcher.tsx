"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { localeCodes, type Locale } from "@/lib/i18n/locale-config";
import { useSwitchLocale } from "@/lib/i18n/use-switch-locale";
import { LocaleFlag } from "@/components/locale-flag";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  variant?: "menu" | "select" | "grid";
  size?: "default" | "toolbar";
  appearance?: "default" | "marketing";
};

const popoverLayerClassName = "z-[200]";

function localeShortCode(locale: Locale): string {
  if (locale === "de-AT") return "AT";
  return locale.split("-")[0].toUpperCase();
}

function LocaleMenuItem({
  code,
  selected,
  disabled,
  onSelect,
  className,
}: {
  code: Locale;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const t = useTranslations("LocaleSwitcher");

  return (
    <DropdownMenuItem
      disabled={disabled}
      onSelect={(event) => {
        event.preventDefault();
        onSelect();
      }}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg py-2.5 pl-2 pr-2.5",
        selected && "bg-accent text-accent-foreground",
        className,
      )}
    >
      <LocaleFlag locale={code} size="md" />
      <span className="min-w-0 flex-1 text-pretty text-sm font-medium leading-snug">
        {t(code)}
      </span>
      {selected ? (
        <Check className="size-4 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
    </DropdownMenuItem>
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
        <p className="col-span-2 mb-1 px-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
              "relative flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-all disabled:opacity-60",
              selected
                ? "border-emerald-300/80 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-200/80 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800/60"
                : "border-slate-200/80 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30",
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <LocaleFlag locale={code} size="lg" ring={false} />
              {selected ? (
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
              ) : null}
            </span>
            <span className="line-clamp-2 text-sm font-semibold leading-snug">{t(code)}</span>
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shortCode = localeShortCode(locale);
  const isMarketing = appearance === "marketing";
  const pendingClass = isPending ? "pointer-events-none opacity-60" : undefined;

  if (variant === "grid") {
    return (
      <LocaleGrid
        className={cn(pendingClass, className)}
        appearance={appearance}
        isPending={isPending}
      />
    );
  }

  if (variant === "select") {
    return (
      <Select
        value={locale}
        disabled={isPending}
        onValueChange={(next) => switchLocale(next as Locale)}
      >
        <SelectTrigger
          className={cn(
            pendingClass,
            "h-11 gap-2 rounded-xl [&>span]:line-clamp-none [&>span]:whitespace-normal",
            isMarketing &&
              "border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/80",
            className,
          )}
          aria-label={t("label")}
        >
          <SelectValue placeholder={t(locale)} />
        </SelectTrigger>
        <SelectContent
          align="start"
          className={cn(popoverLayerClassName, "min-w-[var(--radix-select-trigger-width)] rounded-xl")}
        >
          <SelectGroup>
            {localeCodes.map((code) => (
              <SelectItem key={code} value={code} className="py-2.5">
                <span className="flex items-center gap-3">
                  <LocaleFlag locale={code} size="sm" />
                  <span className="text-pretty leading-snug">{t(code)}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  const triggerClassName = cn(
    pendingClass,
    isMarketing
      ? "h-9 shrink-0 gap-2 rounded-full px-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      : size === "toolbar"
        ? "h-8 shrink-0 gap-2 rounded-full px-2 sm:px-2.5"
        : "gap-2 rounded-full px-2.5",
    className,
  );

  const menuContentClassName = cn(
    popoverLayerClassName,
    "min-w-[15rem] max-w-[min(100vw-1.5rem,20rem)] rounded-xl border bg-popover p-1.5 shadow-lg",
  );

  // Avoid Radix hydration mismatches by rendering the dropdown only after mount.
  if (!mounted) {
    return (
      <Button
        variant={isMarketing ? "ghost" : "outline"}
        size="sm"
        className={triggerClassName}
        aria-label={t("label")}
        disabled={isPending}
      >
        <LocaleFlag locale={locale} size="sm" />
        {size === "toolbar" ? (
          <>
            <span className="font-medium tabular-nums sm:hidden">{shortCode}</span>
            <span className="hidden whitespace-nowrap sm:inline">{t(locale)}</span>
          </>
        ) : (
          <span className="whitespace-nowrap">{t(locale)}</span>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isMarketing ? "ghost" : "outline"}
          size="sm"
          className={triggerClassName}
          aria-label={t("label")}
        >
          <LocaleFlag locale={locale} size="sm" />
          {isMarketing ? (
            <>
              <span className="hidden whitespace-nowrap font-medium sm:inline">{t(locale)}</span>
              <span className="font-medium tabular-nums sm:hidden">{shortCode}</span>
              <ChevronDown className="size-3.5 opacity-50" aria-hidden />
            </>
          ) : size === "default" ? (
            <>
              <span className="whitespace-nowrap">{t(locale)}</span>
              <ChevronDown className="size-3.5 opacity-50" aria-hidden />
            </>
          ) : (
            <>
              <span className="font-medium tabular-nums sm:hidden">{shortCode}</span>
              <span className="hidden whitespace-nowrap sm:inline">{t(locale)}</span>
              <ChevronDown className="hidden size-3.5 opacity-50 sm:inline" aria-hidden />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        className={menuContentClassName}
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("label")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {localeCodes.map((code) => (
          <LocaleMenuItem
            key={code}
            code={code}
            selected={locale === code}
            disabled={isPending}
            onSelect={() => switchLocale(code)}
            className={isMarketing ? "focus:bg-emerald-50 dark:focus:bg-emerald-950/40" : undefined}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
