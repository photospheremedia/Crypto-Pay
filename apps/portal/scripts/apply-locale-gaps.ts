/**
 * Applies professional translations for keys still identical to en.json.
 * Run after sync-locale-messages.ts when en.json structure changes.
 *
 * Usage: pnpm exec tsx scripts/apply-locale-gaps.ts
 */
import { readFile, writeFile } from "fs/promises";
import path from "path";

const MESSAGES_DIR = path.join(process.cwd(), "messages");

type NestedRecord = Record<string, unknown>;

function setPath(obj: NestedRecord, dotPath: string, value: string): void {
  const parts = dotPath.split(".");
  let current: NestedRecord = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    if (!(key in current) || typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as NestedRecord;
  }
  current[parts[parts.length - 1]!] = value;
}

const patches: Record<string, Record<string, string>> = {
  ar: {},
  es: {
    "Common.error": "Error",
    "Footer.legal": "Legal",
    "Account.nav.wallet": "Cartera",
    "Account.activity.roadmap.webhooks.title": "Webhooks",
    "Account.wallets.tabs.wallets": "Carteras",
    "Account.wallets.error": "Error",
    "Account.settings.businessTypes.saas": "SaaS / software",
    "Account.settings.businessTypes.marketplace": "Marketplace",
    "Pricing.business.name": "Escala empresarial",
    "Admin.nav.insights": "Información",
    "Admin.merchants.wallets": "Carteras",
    "Admin.merchants.total": "total",
    "Admin.merchants.leads": "Leads",
    "Auth.email": "Correo electrónico",
    "Legal.terms.eyebrow": "Legal",
    "Legal.privacy.eyebrow": "Legal",
  },
  fr: {
    "Footer.contact": "Contact",
    "Account.activity.roadmap.webhooks.title": "Webhooks",
    "Account.wallets.table.actions": "Actions",
    "Account.settings.themeAuto": "Auto",
    "Account.settings.notificationsSection": "Notifications",
    "Account.settings.businessTypes.marketplace": "Place de marché",
    "Pricing.business.name": "Échelle entreprise",
    "Admin.nav.superAdmin": "Super administrateur",
    "Admin.nav.notifications": "Notifications",
    "Admin.nav.contacts": "Contacts",
    "Admin.merchants.actions": "Actions",
    "Admin.merchants.pageOf": "Page {page} / {total}",
    "Admin.merchants.total": "total",
    "Admin.merchants.leads": "Prospects",
    "Auth.email": "E-mail",
  },
  de: {
    "Common.tagline":
      "Krypto-Zahlungen verfolgen und akzeptieren. Datenschutzorientiert. Wallet zu Wallet.",
    "Common.getStartedFree": "Kostenlos starten",
    "Common.talkToSales": "Vertrieb kontaktieren",
    "Footer.faq": "FAQ",
    "HomePage.metaDescription":
      "Nicht-verwahrende Krypto-Zahlungen direkt in Ihre Wallet. Datenschutzfreundlicher Checkout. In Minuten eingerichtet.",
    "HomePage.heroSubtitle":
      "Datenschutzorientiert. Wallet zu Wallet. In Minuten eingerichtet.",
    "HomePage.heroBody":
      "Empfangen Sie Krypto-Zahlungen aus Ihrem Shop oder Ihrer App direkt in Ihrer Wallet. Wir verwahren Ihre Gelder nicht — Sie behalten die volle Kontrolle.",
    "HomePage.highlightsEyebrow": "Warum Crypto Pay",
    "HomePage.highlightsTitle":
      "Wie die Gateways, denen Händler bereits vertrauen",
    "HomePage.highlights.nonCustodial.title": "Nicht-verwahrend",
    "HomePage.highlights.nonCustodial.description":
      "Zahlungen gehen direkt in Ihre Wallet.",
    "HomePage.highlights.privacyFriendly.title": "Datenschutzfreundlich",
    "HomePage.highlights.privacyFriendly.description":
      "Der Checkout bleibt auf Ihrer Website. Wir verfolgen den Status — wir halten keine Guthaben.",
    "HomePage.highlights.quickSetup.title": "Schnelle Einrichtung",
    "HomePage.highlights.quickSetup.description":
      "Verbinden Sie eine Wallet und erstellen Sie in Minuten Ihren ersten Zahlungslink.",
    "HomePage.integrationsEyebrow": "Integrationen",
    "HomePage.integrationsTitle": "Zahlungslinks, Buttons und API",
    "HomePage.integrationsDescription":
      "Nutzen Sie Zahlungslinks für schnelle Rechnungen, binden Sie Checkout auf Ihrer Website ein oder integrieren Sie unsere Entwickler-API und Webhooks.",
    "HomePage.apiEyebrow": "Entwickler",
    "HomePage.apiTitle": "All-in-one-API für BTC, ETH, USDT und mehr",
    "HomePage.apiDescription":
      "Volle Kontrolle mit der Crypto Pay API. Klare Dokumentation, Webhooks und Support für individuelle Checkout-Flows.",
    "HomePage.apiCta": "Zur API-Dokumentation",
    "HomePage.benefits.limitedKyc.title": "Begrenztes KYC",
    "HomePage.benefits.limitedKyc.description":
      "Wir verarbeiten oder speichern keine Zahlungen. Anforderungen hängen von der Risikobewertung ab, nicht von Verwahrung.",
    "HomePage.benefits.unifiedApi.title": "Einheitliche API",
    "HomePage.benefits.unifiedApi.description":
      "Eine Integration für Zahlungslinks, Charges, Status und Webhook-Callbacks.",
    "Account.dashboard.subtitle":
      "Richten Sie Auszahlungs-Wallets für Ihr Unternehmen ein. Zahlungslinks und Checkout folgen in Kürze.",
    "Account.dashboard.developersTitle": "API & Integration",
    "Account.dashboard.developersDescription":
      "Dokumentation zu Charges, Webhooks und individuellem Checkout",
    "Account.setup.title": "Erste Schritte",
    "Account.setup.description":
      "Schließen Sie diese Schritte ab, bevor Sie Krypto-Zahlungen auf Ihrer Website akzeptieren.",
    "Account.setup.step1Title": "Auszahlungs-Wallet hinzufügen",
    "Account.setup.step1Description":
      "Fügen Sie eine öffentliche Adresse ein, die Sie kontrollieren. Wir fragen nie nach privaten Schlüsseln.",
    "Account.setup.step1Action": "Wallet hinzufügen",
    "Account.setup.step2Title": "Admin-Prüfung",
    "Account.setup.step2Description":
      "Jede neue Adresse wird geprüft, bevor sie Auszahlungen empfangen kann.",
    "Account.setup.step2DescriptionPending":
      "Ihre Wallet ist ausstehend — wir haben unser Team per E-Mail informiert. Nutzen Sie bei Bedarf „Erneut senden“ im Tab Wallets.",
    "Account.setup.step3Title": "Zahlungen akzeptieren (demnächst)",
    "Account.setup.step3Description":
      "Zahlungslinks, Charge-API und On-Chain-Bestätigungs-Webhooks sind in Entwicklung.",
    "Account.setup.step3Action": "Entwicklerdokumentation ansehen",
    "Account.activity.title": "Zahlungsaktivität",
    "Account.activity.badge": "Demnächst",
    "Account.activity.description":
      "On-Chain-Zahlungen und Abrechnungsstatus erscheinen hier, sobald Checkout live ist.",
    "Account.activity.emptyDetail":
      "Noch nichts anzuzeigen — dies ist kein Transaktionsfeed. Sobald Charges live sind, sehen Sie Ereignisse wie unbezahlt, in Bearbeitung und bezahlt.",
    "Account.activity.developersCta": "Entwicklerdokumentation",
    "Account.activity.howItWorksCta": "So funktioniert's",
    "Account.activity.roadmap.charges.title": "Zahlungslinks & Charges",
    "Account.activity.roadmap.charges.description":
      "Anfrage mit Betrag, Coin und Bestellreferenz erstellen.",
    "Account.activity.roadmap.webhooks.description":
      "HTTPS-Callbacks, wenn eine Zahlung on-chain bestätigt wird.",
    "Account.activity.roadmap.history.title": "Verlauf & Export",
    "Account.activity.roadmap.history.description":
      "Zahlungen für die Buchhaltung abgleichen.",
    "Account.wallets.listHint":
      "Speichern sendet die Adresse zur Admin-Prüfung. Sie erhalten eine E-Mail bei Freigabe oder Ablehnung.",
    "Account.wallets.messages.resendCooldown":
      "In den letzten 24 Stunden wurde bereits eine Erinnerung gesendet. Bitte warten oder den Support kontaktieren, falls dringend.",
    "Account.settings.title": "Einstellungen",
    "Account.settings.description":
      "Kontoeinstellungen und Benachrichtigungen verwalten",
    "Account.settings.saveSettings": "Einstellungen speichern",
    "Account.settings.saving": "Speichern…",
    "Account.settings.savedSuccess": "Einstellungen erfolgreich gespeichert!",
    "Account.settings.saveFailed": "Einstellungen konnten nicht gespeichert werden",
    "Account.settings.language": "Sprache",
    "Account.settings.languageHint":
      "Gilt für die gesamte Website. Ihre Wahl wird in Ihrem Konto gespeichert und beim nächsten Besuch verwendet.",
    "Account.settings.walletUpdates": "Wallet- & Zahlungs-E-Mails",
    "Account.settings.walletUpdatesHint":
      "Verifizierungsergebnisse und Zahlungsstatus (sobald Checkout live ist)",
    "Account.settings.marketingEmails": "Produktupdates",
    "Account.settings.marketingEmailsHint":
      "Neuigkeiten zu Crypto Pay-Funktionen und Preisen",
    "Account.settings.businessTypes.online_store": "Online-Shop / E-Commerce",
    "Account.settings.businessTypes.saas": "SaaS / Software",
    "Account.settings.businessTypes.retail": "Einzelhandel",
    "Account.settings.businessTypes.services": "Dienstleistungen",
    "Account.settings.businessTypes.marketplace": "Marktplatz",
    "Pricing.business.name": "Business Scale",
    "Admin.merchants.accountToolsHint":
      "Auth-E-Mails und Sicherheitsaktionen werden über Resend mit Links von Supabase gesendet.",
    "Admin.merchants.accountTools": "Kontotools",
    "Admin.merchants.emailMerchant": "E-Mail an Händler",
    "Admin.merchants.resendEmailVerification": "E-Mail-Verifizierung erneut senden",
    "Admin.merchants.sendEmailVerification": "E-Mail-Verifizierung senden",
    "Admin.merchants.sendPasswordReset": "Passwort-Reset senden",
    "Admin.merchants.revokeSessions": "Alle Sitzungen widerrufen",
    "Admin.merchants.deleteAccount": "Händlerkonto löschen",
    "Admin.merchants.resendWalletVerification": "Wallet-Verifizierung erneut senden",
    "Admin.merchants.accountBanned": "In Supabase Auth gesperrt",
    "Admin.merchants.supabaseToolsTitle": "Supabase- & E-Mail-Tools",
    "Admin.merchants.supabaseToolsDescription":
      "Auth Admin API (Service Role) plus Resend für Händlerkommunikation.",
    "Admin.merchants.supabaseSnapshot": "Supabase Auth-Snapshot",
    "Admin.merchants.confirmEmailSupabase": "E-Mail in Supabase bestätigen",
    "Admin.merchants.syncAuthMetadata": "Profil → Auth-Metadaten synchronisieren",
    "Admin.merchants.banInSupabase": "In Supabase sperren",
    "Admin.merchants.unbanInSupabase": "In Supabase entsperren",
    "Auth.securityCheckTitle": "Bestätigen Sie, dass Sie ein Mensch sind",
    "Auth.securityCheckHint":
      "Kurze Prüfung über Cloudflare — dauert nur eine Sekunde.",
    "Auth.securityCheckVerified": "Verifiziert",
    "Auth.securityCheckFailed": "Prüfung fehlgeschlagen",
    "Auth.securityCheckRetry":
      "Bitte führen Sie die Prüfung erneut durch und senden Sie dann ab.",
    "Auth.securityCheckRequired":
      "Bitte schließen Sie die Sicherheitsprüfung ab, bevor Sie fortfahren.",
    "Auth.tooManyAttempts":
      "Zu viele Versuche. Bitte warten Sie einige Minuten und versuchen Sie es erneut.",
    "Auth.phonePlaceholder": "+49 160 1234567",
  },
  "de-AT": {},
};

// Austrian German inherits German patches, then applies regional overrides.
patches["de-AT"] = {
  ...patches.de,
  "Auth.phonePlaceholder": "+43 660 1234567",
  "LocaleSwitcher.de-AT": "Deutsch (Österreich)",
};

async function main() {
  for (const [locale, localePatches] of Object.entries(patches)) {
    if (locale === "de-AT") continue;

    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    const data = JSON.parse(await readFile(filePath, "utf8")) as NestedRecord;

    for (const [key, value] of Object.entries(localePatches)) {
      setPath(data, key, value);
    }

    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    console.log(`Patched ${locale}.json (${Object.keys(localePatches).length} keys)`);
  }

  // Austrian German: start from patched de, then apply regional overrides.
  const de = JSON.parse(
    await readFile(path.join(MESSAGES_DIR, "de.json"), "utf8"),
  ) as NestedRecord;
  for (const [key, value] of Object.entries(patches["de-AT"]!)) {
    setPath(de, key, value);
  }
  await writeFile(
    path.join(MESSAGES_DIR, "de-AT.json"),
    `${JSON.stringify(de, null, 2)}\n`,
    "utf8",
  );
  console.log(`Synced de-AT.json from de (${Object.keys(patches["de-AT"]!).length} overrides)`);
}

void main();
