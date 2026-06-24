import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const ADMIN_EMAIL = 'mahesh@roarrglobal.com';

interface Payload {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const fromAddress = Deno.env.get('EMAIL_FROM_ADDRESS') || 'Nerve <hello@snagme.app>';

    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — skipping admin email');
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = `Nerve — New access request: ${body.module ?? 'unknown'} — ${body.company_name ?? ''}`.trim();

    const text = `New access request received.

User: ${body.full_name ?? ''}
Company: ${body.company_name ?? ''}
Email: ${body.email ?? ''}
Module requested: ${body.module ?? ''}
ARR range: ${body.company_arr ?? '—'}
Modules interested in: ${(body.modules_requested ?? []).join(', ') || '—'}
How found: ${body.how_found ?? '—'}

Their situation:
${body.current_situation ?? ''}

Review in admin panel:
${new URL(req.url).origin.replace('/functions/v1', '')}/admin/users/${body.user_id ?? ''}
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
