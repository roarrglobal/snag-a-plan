import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const results: Record<string, unknown> = {};
  const { data: buckets } = await admin.storage.listBuckets();
  for (const b of buckets ?? []) {
    const all: string[] = [];
    const walk = async (prefix: string) => {
      const { data } = await admin.storage.from(b.id).list(prefix, { limit: 1000 });
      for (const f of data ?? []) {
        const p = prefix ? `${prefix}/${f.name}` : f.name;
        if (!f.id) await walk(p); // folder
        else all.push(p);
      }
    };
    await walk('');
    if (all.length) {
      const { error } = await admin.storage.from(b.id).remove(all);
      results[b.id] = { removed: all.length, error: error?.message ?? null };
    } else {
      results[b.id] = { removed: 0 };
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
