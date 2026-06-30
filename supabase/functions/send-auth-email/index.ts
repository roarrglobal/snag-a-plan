import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendEmail } from "../_shared/email.ts";
import {
  baseTemplate,
  heading,
  paragraph,
  button,
  divider,
  smallText,
  passwordResetEmail,
} from "../_shared/email-templates.ts";
import { buildAuthConfirmUrl, resolveSiteUrl } from "../_shared/site-url.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Auth email hook — intercepts Supabase auth emails and sends branded versions via Resend.
 * Handles: signup confirmation, magic link, password recovery, email change, invite.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Supabase Auth Hook payload structure
    const emailType = payload.type; // signup, magiclink, recovery, email_change, invite
    const email = payload.email;
    const confirmationUrl = payload.confirmation_url || payload.action_link || "";
    const tokenHash = payload.token_hash || "";
    const redirectTo = payload.redirect_to || "";

    // Build the actual confirmation URL
    let actionUrl = confirmationUrl;
    if (!actionUrl && tokenHash) {
      const siteUrl = Deno.env.get("SITE_URL") || "https://snagme.app";
      actionUrl = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=${emailType}`;
    }

    console.log(`Auth email hook: type=${emailType}, to=${email}`);

    let subject: string;
    let html: string;

    switch (emailType) {
      case "signup": {
        subject = "Confirm your Snag account";
        html = baseTemplate(`
          ${heading("Confirm your email")}
          ${paragraph("Thanks for signing up for Snag! Click the button below to confirm your email address and get started.")}
          ${button("Confirm Email", actionUrl)}
          ${paragraph("This link expires in 24 hours.")}
          ${divider()}
          ${smallText("If you didn't create a Snag account, you can safely ignore this email.")}
        `, "Confirm your Snag email to get started");
        break;
      }

      case "recovery": {
        const result = passwordResetEmail(actionUrl);
        subject = result.subject;
        html = result.html;
        break;
      }

      case "magiclink": {
        subject = "Your Snag sign-in link";
        html = baseTemplate(`
          ${heading("Sign in to Snag")}
          ${paragraph("Click the button below to sign in to your Snag account. No password needed.")}
          ${button("Sign In", actionUrl)}
          ${paragraph("This link expires in 10 minutes and can only be used once.")}
          ${divider()}
          ${smallText("If you didn't request this link, you can safely ignore this email.")}
        `, "Your one-time sign-in link for Snag");
        break;
      }

      case "email_change": {
        subject = "Confirm your new email for Snag";
        html = baseTemplate(`
          ${heading("Confirm your new email")}
          ${paragraph("You requested to change your email address. Click the button below to confirm your new email.")}
          ${button("Confirm New Email", actionUrl)}
          ${paragraph("This link expires in 24 hours.")}
          ${divider()}
          ${smallText("If you didn't request this change, please secure your account immediately.")}
        `, "Confirm your new Snag email address");
        break;
      }

      case "invite": {
        subject = "You've been invited to Snag";
        html = baseTemplate(`
          ${heading("You're invited to Snag")}
          ${paragraph("Someone invited you to join Snag, a decision intelligence platform that helps you make better decisions.")}
          ${button("Accept Invitation", actionUrl)}
          ${paragraph("This link expires in 7 days.")}
          ${divider()}
          ${smallText("If you weren't expecting this invitation, you can safely ignore this email.")}
        `, "You've been invited to join Snag");
        break;
      }

      default: {
        subject = "Notification from Snag";
        html = baseTemplate(`
          ${heading("Action required")}
          ${paragraph("Click the button below to complete your action.")}
          ${button("Continue", actionUrl)}
        `, "Action required on Snag");
        break;
      }
    }

    const result = await sendEmail({ to: email, subject, html });

    if (!result.success) {
      console.error("Auth email send failed:", result.error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Auth email sent: ${emailType} to ${email} (Resend ID: ${result.data?.id})`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auth email hook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
