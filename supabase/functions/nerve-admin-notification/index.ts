import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildAdminUserUrl, resolveSiteUrl } from '../_shared/site-url.ts';

const ADMIN_EMAIL = 'mahesh@roarrglobal.com';

interface Payload {
  trigger?: 'intake' | 'signup';
  full_name?: string;
  company_name?: string;
  email?: string;
  module?: string;
  modules_requested?: string[];
  company_arr?: string | null;
  how_found?: string | null;
  current_situation?: string;
  user_id?: string;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    const trigger = body.trigger ?? 'intake';
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const fromAddress = Deno.env.get('EMAIL_FROM_ADDRESS') || 'Nerve <hello@snagme.app>';

    let payload: Payload = { ...body };
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Signup trigger: dedupe via nerve_user_profiles.signup_notified_at
    if (trigger === 'signup') {
      if (!body.user_id) {
        return new Response(JSON.stringify({ error: 'user_id_required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: profile } = await admin
        .from('nerve_user_profiles')
        .select('full_name, company_name, primary_module, signup_notified_at')
        .eq('id', body.user_id)
        .maybeSingle();

      if (!profile) {
        return new Response(JSON.stringify({ skipped: 'no_profile' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (profile.signup_notified_at) {
        return new Response(JSON.stringify({ skipped: 'already_notified' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: userRes } = await admin.auth.admin.getUserById(body.user_id);
      payload = {
        ...payload,
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        module: profile.primary_module || 'unknown',
        email: userRes?.user?.email || '',
        current_situation: '(Signup completed — intake form not yet submitted.)',
      };
    }

    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — skipping admin email');
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subjectPrefix = trigger === 'signup' ? 'New signup' : 'New access request';
    const subject = `Nerve — ${subjectPrefix}: ${payload.module ?? 'unknown'} — ${payload.company_name ?? ''}`.trim();

    const text = `${trigger === 'signup' ? 'A new user just completed signup.' : 'New access request received.'}

User: ${payload.full_name ?? ''}
Company: ${payload.company_name ?? ''}
Email: ${payload.email ?? ''}
Module requested: ${payload.module ?? ''}
ARR range: ${payload.company_arr ?? '—'}
Modules interested in: ${(payload.modules_requested ?? []).join(', ') || '—'}
How found: ${payload.how_found ?? '—'}

Their situation:
${payload.current_situation ?? ''}

Review in admin panel:
${new URL(req.url).origin.replace('/functions/v1', '')}/admin/users/${payload.user_id ?? ''}
`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [ADMIN_EMAIL],
        subject,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Resend error', res.status, detail);
      return new Response(JSON.stringify({ error: 'email_failed', detail }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (trigger === 'signup' && body.user_id) {
      await admin
        .from('nerve_user_profiles')
        .update({ signup_notified_at: new Date().toISOString() })
        .eq('id', body.user_id);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
