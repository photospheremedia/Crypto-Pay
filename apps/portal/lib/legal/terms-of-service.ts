import type { LegalSection } from "@/lib/legal/types";

export const TERMS_OF_SERVICE_SECTIONS: LegalSection[] = [
  {
    title: "1. Acceptance of Terms",
    paragraphs: [
      "Welcome to Crypto Pay. By accessing or using our platform to accept, track, and manage cryptocurrency payments (the \"Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, do not use the Service.",
      "These Terms constitute a legally binding agreement between you (the \"Merchant\" or \"you\") and Crypto Pay (\"we,\" \"us,\" or \"our\").",
    ],
  },
  {
    title: "2. Eligibility",
    paragraphs: ["To use the Service, you must:"],
    list: [
      "Be at least 18 years old",
      "Operate a legitimate business or authorized commercial activity",
      "Have authority to bind your organization to these Terms",
      "Provide accurate and complete registration information",
      "Comply with applicable laws, including anti-money-laundering and sanctions requirements",
    ],
  },
  {
    title: "3. Account Registration",
    subsections: [
      {
        title: "3.1 Account Creation",
        paragraphs: ["You must create an account to use the Service. You agree to:"],
        list: [
          "Provide accurate, current, and complete information",
          "Maintain and promptly update your account details",
          "Keep login credentials and API keys confidential",
          "Notify us immediately of unauthorized access",
          "Be responsible for all activity under your account",
        ],
      },
      {
        title: "3.2 Account Suspension",
        paragraphs: [
          "We may suspend or terminate your account if you violate these Terms, misuse the Service, or engage in fraudulent, abusive, or unlawful activity.",
        ],
      },
    ],
  },
  {
    title: "4. The Service",
    subsections: [
      {
        title: "4.1 Non-Custodial Payments",
        paragraphs: [
          "Crypto Pay helps merchants create payment requests, monitor blockchain activity, and reconcile payment status. Supported payments settle directly to wallet addresses you control. We do not take custody of customer funds on your behalf.",
        ],
      },
      {
        title: "4.2 Permitted Use",
        paragraphs: ["You may use the Service to:"],
        list: [
          "Accept cryptocurrency payments for legitimate goods and services",
          "Generate payment links, checkout flows, and API integrations",
          "View transaction status, reporting, and merchant dashboard features",
          "Communicate with our support team regarding your account",
        ],
      },
      {
        title: "4.3 Prohibited Use",
        paragraphs: ["You agree not to:"],
        list: [
          "Violate any applicable law, regulation, or sanctions program",
          "Process payments for illegal goods, services, or fraud schemes",
          "Misrepresent supported assets, settlement times, or fees to customers",
          "Attempt unauthorized access, scraping, or reverse engineering of the Service",
          "Transmit malware or interfere with platform operation",
          "Use the Service to launder funds or conceal illicit activity",
          "Resell or sublicense the Service without our written consent",
        ],
      },
    ],
  },
  {
    title: "5. Payments, Fees, and Settlement",
    subsections: [
      {
        title: "5.1 Payment Requests",
        paragraphs: [
          "When you create a payment request, you specify amount, asset, and destination wallet. Customers send funds on-chain to the address associated with that request. Blockchain transactions are irreversible once confirmed.",
        ],
      },
      {
        title: "5.2 Fees",
        paragraphs: [
          "Fees for use of the Service are described on our pricing page and in your merchant agreement. Network fees charged by blockchains are separate and paid to miners or validators, not to Crypto Pay.",
        ],
      },
      {
        title: "5.3 Supported Assets",
        paragraphs: [
          "We may add or remove supported cryptocurrencies from time to time. You are responsible for confirming asset, network, and address compatibility before accepting payment.",
        ],
      },
      {
        title: "5.4 No Guarantee of Confirmation",
        paragraphs: [
          "We use commercially reasonable methods to detect on-chain payments, but we do not guarantee detection speed, accuracy in all network conditions, or protection against user error (wrong asset, wrong network, underpayment, or delayed confirmation).",
        ],
      },
    ],
  },
  {
    title: "6. Intellectual Property",
    subsections: [
      {
        title: "6.1 Our Rights",
        paragraphs: [
          "The Service, including software, branding, documentation, and related content, is owned by Crypto Pay and protected by intellectual property laws.",
        ],
      },
      {
        title: "6.2 License",
        paragraphs: [
          "We grant you a limited, non-exclusive, non-transferable license to access and use the Service for your internal business operations in accordance with these Terms.",
        ],
      },
      {
        title: "6.3 Your Content",
        paragraphs: [
          "You retain ownership of content you submit. You grant us a license to host, process, and display that content as needed to operate and improve the Service.",
        ],
      },
    ],
  },
  {
    title: "7. Privacy and Data Protection",
    paragraphs: [
      {
        text: "Your use of the Service is also governed by our Privacy Policy, which explains how we collect, use, and protect information.",
        links: [{ match: "Privacy Policy", href: "/privacy-policy" }],
      },
    ],
  },
  {
    title: "8. Third-Party Services",
    paragraphs: [
      "The Service may rely on third-party infrastructure (for example, cloud hosting, authentication, analytics, email, and blockchain data providers). We are not responsible for third-party outages, policies, or acts outside our control.",
    ],
  },
  {
    title: "9. Disclaimers",
    subsections: [
      {
        title: "9.1 As-Is Service",
        paragraphs: [
          "THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
        ],
      },
      {
        title: "9.2 Crypto and Market Risk",
        paragraphs: [
          "Cryptocurrency values can be volatile. We do not provide investment, tax, or legal advice. You are solely responsible for pricing, refunds, accounting, and regulatory obligations related to accepting crypto.",
        ],
      },
    ],
  },
  {
    title: "10. Limitation of Liability",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, CRYPTO PAY SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA, OR BUSINESS INTERRUPTION.",
      "Our total liability for any claim arising out of these Terms or the Service shall not exceed the greater of (a) fees you paid us in the twelve months before the claim or (b) one hundred U.S. dollars (USD $100).",
    ],
  },
  {
    title: "11. Indemnification",
    paragraphs: ["You agree to indemnify and hold harmless Crypto Pay from claims arising out of:"],
    list: [
      "Your use of the Service",
      "Your violation of these Terms",
      "Your violation of law or third-party rights",
      "Payments, refunds, or customer disputes related to your business",
    ],
  },
  {
    title: "12. Service Modifications",
    paragraphs: [
      "We may modify, suspend, or discontinue features of the Service. We will provide reasonable notice of material changes when practicable.",
    ],
  },
  {
    title: "13. Term and Termination",
    subsections: [
      {
        title: "13.1 Term",
        paragraphs: ["These Terms remain in effect while you use the Service."],
      },
      {
        title: "13.2 Termination",
        paragraphs: ["Either party may end the relationship as follows:"],
        list: [
          "You may close your account at any time",
          "We may suspend or terminate access for violations or risk concerns",
          "We may discontinue the Service with notice where feasible",
        ],
      },
      {
        title: "13.3 Effect of Termination",
        paragraphs: ["Upon termination:"],
        list: [
          "Your right to use the Service ends immediately",
          "We may delete or retain data as described in our Privacy Policy",
          "Outstanding fee obligations survive termination",
          "Sections that by nature should survive will continue to apply",
        ],
      },
    ],
  },
  {
    title: "14. Dispute Resolution",
    subsections: [
      {
        title: "14.1 Informal Resolution",
        paragraphs: [
          "Before filing a claim, contact us at support@cryptopay.sale so we can try to resolve the dispute informally.",
        ],
      },
      {
        title: "14.2 Governing Law",
        paragraphs: [
          "These Terms are governed by the laws of the United States, without regard to conflict-of-law principles, except where mandatory local law applies.",
        ],
      },
    ],
  },
  {
    title: "15. General Provisions",
    subsections: [
      {
        title: "15.1 Entire Agreement",
        paragraphs: [
          "These Terms, together with our Privacy Policy and any order or merchant agreement, form the entire agreement between you and Crypto Pay regarding the Service.",
        ],
      },
      {
        title: "15.2 Severability",
        paragraphs: ["If any provision is unenforceable, the remaining provisions remain in effect."],
      },
      {
        title: "15.3 Assignment",
        paragraphs: [
          "You may not assign these Terms without our consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.",
        ],
      },
      {
        title: "15.4 Force Majeure",
        paragraphs: [
          "We are not liable for delays or failures caused by events beyond our reasonable control, including network congestion, chain forks, or infrastructure outages.",
        ],
      },
    ],
  },
  {
    title: "16. Changes to Terms",
    paragraphs: [
      "We may update these Terms from time to time. We will notify you of material changes by email or in-product notice. Continued use after the effective date constitutes acceptance.",
    ],
  },
];
