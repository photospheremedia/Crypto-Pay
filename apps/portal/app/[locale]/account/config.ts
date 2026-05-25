// Account section pages structure
export const accountSections = {
  profile: {
    title: "Profile",
    href: "/account/profile",
    description: "Manage your personal information and profile",
  },
  security: {
    title: "Security",
    href: "/account/security",
    description: "Password, 2FA, and security settings",
  },
  preferences: {
    title: "Preferences",
    href: "/account/preferences",
    description: "Customize your experience",
  },
  notifications: {
    title: "Notifications",
    href: "/account/notifications",
    description: "Manage notification preferences",
  },
  connected: {
    title: "Connected Accounts",
    href: "/account/connected",
    description: "Manage linked accounts",
  },
  privacy: {
    title: "Privacy & Data",
    href: "/account/privacy",
    description: "Control your data and privacy",
  },
} as const;
