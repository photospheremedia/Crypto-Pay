import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminIndexPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/admin/dashboard", locale: locale as Locale });
}
