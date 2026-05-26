/**
 * Admin Invite Email Template
 * Built with React Email for professional, tested rendering
 * Based on Vercel's invite pattern - industry best practice
 */

import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { getEmailLogoImageUrl } from '@/lib/email/brand-assets';

export interface AdminInviteEmailProps {
  recipientName: string;
  recipientEmail: string;
  inviterName: string;
  inviterEmail?: string;
  role: 'cp_admin' | 'rhs_admin' | 'admin' | 'owner' | 'staff';
  loginUrl: string;
  temporaryPassword?: string;
  companyName?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cryptopay.sale";

// Role display names and colors
const roleConfig = {
  cp_admin: {
    name: 'Super Administrator',
    color: '#7c3aed',
    icon: '👑',
    permissions: [
      'Full platform administration',
      'Manage all merchants and users',
      'Access audit logs and analytics',
      'Configure system settings',
    ],
  },
  rhs_admin: {
    name: 'Super Administrator',
    color: '#7c3aed',
    icon: '👑',
    permissions: [
      'Full platform administration',
      'Manage all merchants and users',
      'Access audit logs and analytics',
      'Configure system settings',
    ],
  },
  admin: {
    name: 'Administrator',
    color: '#10b981',
    icon: '⭐',
    permissions: [
      'Manage leads and orders',
      'View analytics dashboard',
      'Manage team members',
      'Configure business settings',
    ],
  },
  owner: {
    name: 'Business Owner',
    color: '#0891b2',
    icon: '🏪',
    permissions: [
      'Manage your merchant profile',
      'View payments and analytics',
      'Configure payout wallets',
      'Access financial reports',
    ],
  },
  staff: {
    name: 'Staff Member',
    color: '#059669',
    icon: '👤',
    permissions: [
      'Process orders',
      'View assigned tasks',
      'Update order status',
      'Access help resources',
    ],
  },
};

export const AdminInviteEmail = ({
  recipientName = 'Team Member',
  recipientEmail = 'user@example.com',
  inviterName = 'Admin',
  inviterEmail,
  role = 'admin',
  loginUrl = "https://cryptopay.sale/login",
  temporaryPassword,
  companyName = 'Crypto Pay',
  inviteFromIp,
  inviteFromLocation,
}: AdminInviteEmailProps) => {
  const roleInfo = roleConfig[role] || roleConfig.admin;
  const previewText = `${inviterName} has invited you to join ${companyName} as ${roleInfo.name}`;

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: '#10b981',
                'brand-dark': '#059669',
              },
            },
          },
        }}
      >
        <Body className="bg-[#f6f9fc] my-auto mx-auto font-sans px-2">
          <Container className="bg-white my-[40px] mx-auto p-[20px] max-w-[465px] rounded-[8px] border border-solid border-[#eaeaea]">
            {/* Logo */}
            <Section className="mt-[32px]">
              <Img
                src={getEmailLogoImageUrl()}
                width="56"
                height="56"
                alt={companyName}
                className="my-0 mx-auto rounded-[12px]"
              />
            </Section>

            {/* Header */}
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Join <strong>{companyName}</strong>
            </Heading>

            {/* Greeting */}
            <Text className="text-black text-[14px] leading-[24px]">
              Hello <strong>{recipientName}</strong>,
            </Text>

            {/* Invitation message */}
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{inviterName}</strong>
              {inviterEmail && (
                <>
                  {' '}(
                  <Link
                    href={`mailto:${inviterEmail}`}
                    className="text-blue-600 no-underline"
                  >
                    {inviterEmail}
                  </Link>
                  )
                </>
              )}{' '}
              has invited you to join the <strong>{companyName}</strong> team.
            </Text>

            {/* Role Badge */}
            <Section className="my-[24px] p-[20px] bg-[#f9fafb] rounded-[8px] border border-solid border-[#eaeaea]">
              <Row>
                <Column className="w-[50px]">
                  <Text className="text-[32px] m-0">{roleInfo.icon}</Text>
                </Column>
                <Column>
                  <Text className="text-[12px] uppercase tracking-[1px] text-[#6b7280] m-0 mb-[4px] font-semibold">
                    Your Role
                  </Text>
                  <Text
                    className="text-[18px] font-bold m-0"
                    style={{ color: roleInfo.color }}
                  >
                    {roleInfo.name}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Temporary Password (if provided) */}
            {temporaryPassword && (
              <Section className="my-[24px] p-[20px] bg-[#fef3c7] rounded-[8px] border border-solid border-[#fcd34d]">
                <Row>
                  <Column className="w-[40px]">
                    <Text className="text-[24px] m-0">🔐</Text>
                  </Column>
                  <Column>
                    <Text className="text-[12px] text-[#92400e] m-0 mb-[8px] font-semibold">
                      Your Temporary Password
                    </Text>
                    <Text className="text-[18px] font-mono font-bold text-[#78350f] m-0 p-[8px] bg-[#fffbeb] rounded-[4px] tracking-[2px]">
                      {temporaryPassword}
                    </Text>
                    <Text className="text-[12px] text-[#92400e] m-0 mt-[8px]">
                      Please change this after your first login.
                    </Text>
                  </Column>
                </Row>
              </Section>
            )}

            {/* OAuth Info (if no password) */}
            {!temporaryPassword && (
              <Section className="my-[24px] p-[16px] bg-[#f0fdf4] rounded-[8px] border border-solid border-[#86efac]">
                <Row>
                  <Column className="w-[40px]">
                    <Text className="text-[24px] m-0">🔑</Text>
                  </Column>
                  <Column>
                    <Text className="text-[14px] text-[#166534] m-0 font-semibold">
                      Sign in with your Google account
                    </Text>
                    <Text className="text-[13px] text-[#15803d] m-0 mt-[4px]">
                      Use <strong>{recipientEmail}</strong> to sign in securely
                    </Text>
                  </Column>
                </Row>
              </Section>
            )}

            {/* CTA Button */}
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-brand rounded-[8px] text-white text-[14px] font-semibold no-underline text-center px-[24px] py-[14px]"
                href={loginUrl}
              >
                🚀 Access Your Dashboard
              </Button>
            </Section>

            {/* URL Fallback */}
            <Text className="text-[14px] leading-[24px] text-center text-[#666666]">
              or copy and paste this URL into your browser:{' '}
              <Link href={loginUrl} className="text-brand no-underline">
                {loginUrl}
              </Link>
            </Text>

            {/* Permissions List */}
            <Section className="mt-[32px]">
              <Text className="text-black text-[14px] font-semibold mb-[12px]">
                What you can do as {roleInfo.name}:
              </Text>
              {roleInfo.permissions.map((permission, index) => (
                <Text
                  key={index}
                  className="text-[14px] text-[#4b5563] m-0 mb-[8px] leading-[20px]"
                >
                  <span style={{ color: roleInfo.color }}>✓</span> {permission}
                </Text>
              ))}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            {/* Security Footer */}
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This invitation was intended for{' '}
              <span className="text-black">{recipientEmail}</span>.
              {inviteFromIp && (
                <>
                  {' '}This invite was sent from{' '}
                  <span className="text-black">{inviteFromIp}</span>
                </>
              )}
              {inviteFromLocation && (
                <>
                  {' '}located in{' '}
                  <span className="text-black">{inviteFromLocation}</span>
                </>
              )}
              . If you were not expecting this invitation, you can ignore this
              email. If you are concerned about your account's safety, please
              reply to this email to get in touch with us.
            </Text>

            {/* Company Footer */}
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#8898aa] text-[12px] leading-[16px] text-center">
              {companyName} • Powering restaurant success
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Preview props for development/testing
AdminInviteEmail.PreviewProps = {
  recipientName: 'Alex Merchant',
  recipientEmail: 'merchant@example.com',
  inviterName: 'Crypto Pay Admin',
  inviterEmail: 'noreply@cryptopay.sale',
  role: 'admin',
  loginUrl: 'https://cryptopay.sale/login',
  temporaryPassword: 'TempPass123!',
  companyName: 'Crypto Pay',
} satisfies AdminInviteEmailProps;

export default AdminInviteEmail;
