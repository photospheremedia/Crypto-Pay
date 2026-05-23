import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { checkAdminAccess } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email/sender";
import { render } from "@react-email/render";
import { AdminInviteEmail } from "@/emails/admin-invite";

// Generate a secure temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// POST - Invite a new admin user
export async function POST(req: NextRequest) {
  try {
    const { user, role, isSuperAdmin, permissions } = await checkAdminAccess();
    
    if (!user || !role || !permissions) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admins can invite other super admins
    // Other admins can invite lower roles
    if (!permissions.canManageStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      email, 
      fullName, 
      newRole = 'admin', 
      useTemporaryPassword = false,
      sendInviteEmail = true 
    } = body;

    if (!email || !fullName) {
      return NextResponse.json({ 
        error: "Email and full name are required" 
      }, { status: 400 });
    }

    // Only super admins can create other super admins
    if (newRole === 'rhs_admin' && !isSuperAdmin) {
      return NextResponse.json({ 
        error: "Only super admins can invite other super admins" 
      }, { status: 403 });
    }

    const supabase = await createClient();

    // Check if user already exists in auth.users
    // IMPORTANT: Also fetch full_name to use verified database name
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id, email, full_name")
      .eq("email", email)
      .maybeSingle();

    let userId: string;
    let temporaryPassword: string | undefined;
    let isNewUser = false;
    
    // Use database name for existing users, fallback to form input for new users
    let recipientName = fullName;

    if (existingProfile) {
      userId = existingProfile.id;
      // CRITICAL: Use verified name from database, not form input
      recipientName = existingProfile.full_name || fullName;
      
      // Check if they already have admin access
      const { data: existingMembership } = await supabase
        .from("memberships")
        .select("id, role, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (existingMembership) {
        return NextResponse.json({ 
          error: `User already has ${existingMembership.role} access`,
          existingRole: existingMembership.role
        }, { status: 400 });
      }
    } else {
      // Create new user with Supabase Admin API
      isNewUser = true;
      
      // Use service role to create user
      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      if (useTemporaryPassword) {
        temporaryPassword = generateTemporaryPassword();
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: fullName,
            invited_by: user.email,
            invited_at: new Date().toISOString(),
            invited_role: newRole,
          }
        });

        if (createError) {
          console.error("[Admin Invite] Create user error:", createError);
          return NextResponse.json({ 
            error: "Failed to create user account",
            details: createError.message
          }, { status: 500 });
        }

        userId = newUser.user.id;
      } else {
        // Create user without password (OAuth only)
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            invited_by: user.email,
            invited_at: new Date().toISOString(),
            invited_role: newRole,
          }
        });

        if (createError) {
          console.error("[Admin Invite] Create user error:", createError);
          return NextResponse.json({ 
            error: "Failed to create user account",
            details: createError.message
          }, { status: 500 });
        }

        userId = newUser.user.id;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role: newRole === 'rhs_admin' ? 'super_admin' : newRole,
        });

      if (profileError) {
        console.error("[Admin Invite] Profile error:", profileError);
        // Continue anyway, trigger should create it
      }
    }

    // Get or create admin tenant
    let tenantId: string;
    const { data: adminTenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", "rhs-admin")
      .maybeSingle();

    if (adminTenant) {
      tenantId = adminTenant.id;
    } else {
      const { data: newTenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          name: "Crypto Pay Admin",
          slug: "rhs-admin",
          status: "active"
        })
        .select("id")
        .single();

      if (tenantError) {
        console.error("[Admin Invite] Tenant error:", tenantError);
        return NextResponse.json({ 
          error: "Failed to create admin tenant" 
        }, { status: 500 });
      }
      tenantId = newTenant.id;
    }

    // Create membership
    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        role: newRole,
        status: "active"
      });

    if (membershipError) {
      console.error("[Admin Invite] Membership error:", membershipError);
      return NextResponse.json({ 
        error: "Failed to create membership",
        details: membershipError.message
      }, { status: 500 });
    }

    // Get inviter's verified name from database
    const { data: inviterProfile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    
    const inviterName = inviterProfile?.full_name || user.user_metadata?.full_name || user.email || 'Admin';

    // Send invite email using React Email
    let emailSent = false;
    if (sendInviteEmail) {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://cryptopay.sale"}/app/admin`;
      
      // Render React Email template to HTML
      const emailHtml = await render(
        AdminInviteEmail({
          recipientName,  // Uses database name for existing users
          recipientEmail: email,
          inviterName,    // Uses inviter's database name
          inviterEmail: user.email,
          role: newRole as 'rhs_admin' | 'admin' | 'owner' | 'staff',
          loginUrl,
          temporaryPassword,
          companyName: "Crypto Pay",
        })
      );

      const result = await sendEmail({
        to: { email, name: recipientName },
        subject: "You've been invited to Crypto Pay",
        html: emailHtml,
        tags: ['admin-invite', newRole],
      });

      emailSent = result.success;
      if (!result.success) {
        console.warn("[Admin Invite] Email failed:", result.error);
      }
    }

    // Log audit event
    try {
      await supabase.rpc("log_audit_event", {
        p_action: "admin_invite",
        p_resource_type: "admin",
        p_resource_id: userId,
        p_description: `Invited ${email} as ${newRole}`,
        p_new_values: { 
          email, 
          full_name: recipientName,  // Use verified name
          role: newRole,
          is_new_user: isNewUser,
          email_sent: emailSent
        },
      });
    } catch (auditError) {
      console.warn("[Admin Invite] Audit log failed:", auditError);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully invited ${recipientName} as ${newRole}`,
      data: {
        userId,
        email,
        fullName,
        role: newRole,
        isNewUser,
        emailSent,
        hasTemporaryPassword: !!temporaryPassword,
      }
    });

  } catch (error) {
    console.error("[Admin Invite] Error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// GET - List pending invites (for future use)
export async function GET(req: NextRequest) {
  try {
    const { user, permissions } = await checkAdminAccess();
    
    if (!user || !permissions?.canManageStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return empty - could track pending invites in a separate table
    return NextResponse.json({ 
      success: true, 
      invites: [],
      message: "Pending invites tracking coming soon"
    });

  } catch (error) {
    console.error("[Admin Invite] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
