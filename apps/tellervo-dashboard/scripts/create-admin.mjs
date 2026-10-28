#!/usr/bin/env node
/**
 * Tellervo Admin Provisioning Script
 * 
 * Usage:
 *   node scripts/create-admin.mjs <email> <password> [name] [service_role_key]
 *
 * Example:
 *   node scripts/create-admin.mjs admin@tellervo.com NordicReserve2026! "Headmaster Admin"
 */

import { createClient } from "@supabase/supabase-js";
import process from "node:process";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://alextavpyuifokaoyxkv.supabase.co";

// Retrieve arguments
const args = process.argv.slice(2);
const email = args[0];
const password = args[1];
const fullName = args[2] || "Tellervo Admin";
const serviceRoleKey = args[3] || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("\n ---------------------------------------------------");
console.log(" TELLERVO ADMIN PROVISIONING SCRIPT");
console.log(" ----------------------------------------------------\n");

if (!email || !password) {
  console.error(" Error: Missing required arguments.\n");
  console.log("Usage:");
  console.log("  node scripts/create-admin.mjs <email> <password> [fullName] [service_role_key]\n");
  console.log("Example:");
  console.log('  node scripts/create-admin.mjs admin@tellervo.com MySecretPass123! "Master Admin"');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error(" Error: Supabase Service Role Key is required to create or promote admin users.");
  console.log("\nHow to get your Service Role Key:");
  console.log("1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/alextavpyuifokaoyxkv/settings/api");
  console.log("2. Copy the 'service_role' secret key (under Project API keys).");
  console.log("3. Either pass it as the 4th argument or set the SUPABASE_SERVICE_ROLE_KEY environment variable:\n");
  console.log(`   $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"`);
  console.log(`   node scripts/create-admin.mjs "${email}" "${password}" "${fullName}"\n`);
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function provisionAdmin() {
  const cleanEmail = email.trim().toLowerCase();

  console.log(`Checking existing users for: ${cleanEmail}...`);

  // Search for existing user
  const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error(" Failed to query user list:", listError.message);
    process.exit(1);
  }

  const existingUser = userList?.users?.find(
    (u) => u.email?.toLowerCase() === cleanEmail
  );

  let userId;

  if (existingUser) {
    console.log(`Found existing user (ID: ${existingUser.id}). Promoting to admin...`);
    userId = existingUser.id;

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password: password,
        email_confirm: true,
        app_metadata: {
          ...existingUser.app_metadata,
          role: "admin",
        },
        user_metadata: {
          ...existingUser.user_metadata,
          role: "admin",
          full_name: fullName,
        },
      }
    );

    if (updateError) {
      console.error(" Failed to promote user:", updateError.message);
      process.exit(1);
    }

    console.log(" User authentication record updated with admin role!");
  } else {
    console.log(`Creating new admin account for: ${cleanEmail}...`);

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      app_metadata: {
        role: "admin",
      },
      user_metadata: {
        role: "admin",
        full_name: fullName,
      },
    });

    if (createError) {
      console.error(" Failed to create admin user:", createError.message);
      process.exit(1);
    }

    userId = newUser.user.id;
    console.log(` User created successfully! (ID: ${userId})`);
  }

  // Ensure public.profiles record has Founder Patron tier and admin profile
  console.log(`Updating public.profiles record for ID: ${userId}...`);
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: cleanEmail,
        full_name: fullName,
        tier: "Founder Patron",
        seeds: 9999,
        trees_planted: 100,
        address: "Tellervo HQ, Helsinki",
      },
      { onConflict: "id" }
    );

  if (profileError) {
    console.warn(" Note on profiles table:", profileError.message);
  } else {
    console.log(" Profile record updated with 'Founder Patron' tier.");
  }

  console.log("\n ----------------------------------------------------");
  console.log("ADMIN ACCOUNT READY FOR LOGIN");
  console.log("----------------------------------------------------");
  console.log(`   Email:    ${cleanEmail}`);
  console.log(`   Role:     admin (app_metadata & user_metadata)`);
  console.log(`   Tier:     Founder Patron`);
  console.log(`   Portal:   http://localhost:5174/login`);
  console.log("----------------------------------------------------\n");
}

provisionAdmin().catch((err) => {
  console.error(" Unexpected error:", err);
  process.exit(1);
});
