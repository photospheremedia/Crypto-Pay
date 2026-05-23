import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
config({ path: ".env.local" });

// Clean env values (remove \n artifacts from Vercel CLI)
const cleanEnv = (val: string | undefined) => val?.replace(/\\n/g, "").trim();

const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)!;
const serviceRoleKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixMissingProfiles() {
  console.log("🔍 Finding users without profiles...\n");

  // Get all auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Error listing users:", authError);
    return;
  }

  console.log(`Found ${authUsers.users.length} auth users\n`);

  for (const user of authUsers.users) {
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(`Error checking profile for ${user.email}:`, profileError);
      continue;
    }

    if (!profile) {
      console.log(`⚠️ Missing profile for: ${user.email} (${user.id})`);
      
      // Create profile
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          avatar_url: user.user_metadata?.avatar_url || null,
        });

      if (insertError) {
        console.error(`  ❌ Failed to create profile:`, insertError.message);
      } else {
        console.log(`  ✅ Created profile for ${user.email}`);
      }
    } else {
      console.log(`✅ Profile exists for: ${user.email}`);
    }
  }

  console.log("\n✨ Done!");
}

fixMissingProfiles();
