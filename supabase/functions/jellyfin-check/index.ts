const JELLYFIN_URL = Deno.env.get("JELLYFIN_URL")!;
const JELLYFIN_API_KEY = Deno.env.get("JELLYFIN_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { tmdb_ids } = await req.json() as { tmdb_ids: number[] };

    if (!tmdb_ids?.length) {
      return new Response(JSON.stringify({ results: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<number, { available: boolean; jellyfin_id?: string }> = {};

    // Batch: check multiple IDs in parallel (max 20 per request)
    const ids = tmdb_ids.slice(0, 20);

    await Promise.all(
      ids.map(async (tmdbId) => {
        const url = `${JELLYFIN_URL}/Items?AnyProviderIdEquals=tmdb.${tmdbId}&Recursive=true&IncludeItemTypes=Movie&Fields=ProviderIds&Limit=1&api_key=${JELLYFIN_API_KEY}`;

        const res = await fetch(url);

        if (!res.ok) {
          results[tmdbId] = { available: false };
          return;
        }

        const data = await res.json();
        const item = data.Items?.[0];

        results[tmdbId] = {
          available: !!item,
          jellyfin_id: item?.Id,
        };
      }),
    );

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Jellyfin check error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
