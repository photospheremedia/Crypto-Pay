import type { LegalSection } from "@/lib/legal/types";

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    title: "1. Introduction",
    paragraphs: [
      "Crypto Pay (\"we,\" \"our,\" or \"us\") provides tools for merchants to accept and track cryptocurrency payments. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our website, dashboard, APIs, and related services (collectively, the \"Service\").",
    ],
  },
  {
    title: "2. Information We Collect",
    subsections: [
      {
        title: "2.1 Information You Provide",
        list: [
          "Account information: name, email, company name, phone number",
          "Business details: merchant profile, billing contacts, support communications",
          "Payment configuration: wallet addresses, callback URLs, API credentials metadata",
          "Communications: support tickets, feedback, and survey responses",
        ],
      },
      {
        title: "2.2 Payment and Transaction Data",
        list: [
          "Payment request metadata (amount, asset, status, timestamps)",
          "Public blockchain data associated with your payment requests (for example, transaction hashes, sender/receiver addresses, confirmations)",
          "We do not ask for or store private keys or seed phrases",
        ],
      },
      {
        title: "2.3 Automatically Collected Information",
        list: [
          "Usage data: pages visited, features used, and interaction logs",
          "Device and network data: IP address, browser type, operating system",
          "Cookies and similar technologies as described in Section 8",
        ],
      },
    ],
  },
  {
    title: "3. How We Use Your Information",
    paragraphs: ["We use information to:"],
    list: [
      "Provide, operate, and improve the Service",
      "Authenticate users and secure accounts",
      "Detect and reconcile on-chain payments",
      "Send transactional notices (for example, payment status, security alerts)",
      "Provide customer support",
      "Analyze usage to improve reliability and performance",
      "Prevent fraud, abuse, and security incidents",
      "Comply with legal obligations",
    ],
  },
  {
    title: "4. How We Share Information",
    subsections: [
      {
        title: "4.1 Service Providers",
        paragraphs: [
          "We use trusted providers for hosting, authentication, email delivery, analytics, and infrastructure operations. They may process data only to perform services on our behalf and subject to contractual safeguards.",
        ],
      },
      {
        title: "4.2 Legal and Safety",
        paragraphs: [
          "We may disclose information if required by law, legal process, or to protect rights, safety, and integrity of users and the Service.",
        ],
      },
      {
        title: "4.3 Business Transfers",
        paragraphs: [
          "If we are involved in a merger, acquisition, or asset sale, information may transfer as part of that transaction with appropriate notice where required.",
        ],
      },
      {
        title: "4.4 No Sale of Personal Information",
        paragraphs: ["We do not sell your personal information."],
      },
    ],
  },
  {
    title: "5. Data Security",
    paragraphs: [
      "We implement administrative, technical, and organizational measures designed to protect information, including encryption in transit, access controls, and monitoring. No method of transmission or storage is completely secure.",
    ],
    list: [
      "Encryption in transit (TLS)",
      "Secure authentication and session management",
      "Role-based access for internal systems",
      "Infrastructure hosted with reputable cloud providers",
    ],
  },
  {
    title: "6. Your Privacy Rights",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, delete, restrict, or port your personal information, and to object to certain processing. To exercise rights, contact support@cryptopay.sale.",
    ],
  },
  {
    title: "7. Data Retention",
    paragraphs: [
      "We retain information for as long as needed to provide the Service, meet legal obligations, resolve disputes, and enforce agreements. Retention periods vary by data type.",
    ],
  },
  {
    id: "cookies",
    title: "8. Cookies and Tracking",
    paragraphs: [
      "We use cookies and similar technologies to operate the Service and understand usage:",
    ],
    list: [
      "Essential cookies: required for authentication and core functionality",
      "Preference cookies: remember settings such as locale",
      "Analytics cookies: help us understand performance and usage patterns",
    ],
    subsections: [
      {
        title: "Managing Cookies",
        paragraphs: [
          "You can control cookies through your browser settings and our cookie consent banner. Disabling essential cookies may limit functionality.",
        ],
      },
    ],
  },
  {
    title: "9. Third-Party Links",
    paragraphs: [
      "The Service may link to third-party sites (for example, block explorers or documentation). Their privacy practices are governed by their own policies.",
    ],
  },
  {
    title: "10. Children's Privacy",
    paragraphs: [
      "The Service is intended for businesses and individuals 18 or older. We do not knowingly collect personal information from children.",
    ],
  },
  {
    title: "11. International Data Transfers",
    paragraphs: [
      "Your information may be processed in countries other than your own. We use appropriate safeguards where required by applicable law.",
    ],
  },
  {
    title: "12. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. We will notify you of material changes by email or in-product notice. Continued use after the effective date constitutes acceptance.",
    ],
  },
  {
    title: "13. California Privacy Rights (CCPA)",
    paragraphs: ["If you are a California resident, you may have rights to:"],
    list: [
      "Know categories of personal information collected and disclosed",
      "Request deletion of personal information, subject to exceptions",
      "Opt out of sale (we do not sell personal information)",
      "Not receive discriminatory treatment for exercising privacy rights",
    ],
  },
  {
    title: "14. GDPR (EU/EEA)",
    paragraphs: ["If you are in the EU or EEA, you may have additional rights under GDPR, including:"],
    list: [
      "Legal bases such as contract performance, legitimate interests, and consent where applicable",
      "Right to lodge a complaint with a supervisory authority",
      "Right to object to certain processing",
    ],
  },
];
