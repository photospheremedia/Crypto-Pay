"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeCodes, type Locale } from "@/lib/i18n/locale-config";
import { persistUserLocale } from "@/lib/i18n/locale-actions";
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
   * `menu` — compact globe trigger for headers (shadcn DropdownMenu + radio items).
   * `select` — full-width control for settings panels and mobile drawers.
   */
  variant?: "menu" | "select";
};

function useSwitchLocale() {
  const router = useRouter();
  const pathname = usePathname();

  return (next: Locale) => {
    // Cookie: next-intl middleware sets NEXT_LOCALE on router.replace.
    // Database: sync preference for authenticated users (emails, return visits).
    void persistUserLocale(next);
    router.replace(pathname, { locale: next });
  };
}

/** Site-wide language control. Use this instead of custom locale pickers. */
export function LocaleSwitcher({ className, variant = "menu" }: LocaleSwitcherProps) {
  const locale = useLocale() as Locale;
  const switchLocale = useSwitchLocale();
  const t = useTranslations("LocaleSwitcher");

  if (variant === "select") {
    return (
      <Select value={locale} onValueChange={(next) => switchLocale(next as Locale)}>
        <SelectTrigger className={className} aria-label={t("label")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("rounded-full gap-1.5", className)}
          aria-label={t("label")}
        >
          <Languages data-icon="inline-start" />
          <span className="max-w-[7rem] truncate">{t(locale)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={(next) => switchLocale(next as Locale)}
          >
            {localeCodes.map((code) => (
              <DropdownMenuRadioItem key={code} value={code}>
                {t(code)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
