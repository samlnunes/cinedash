import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "CineDash <noreply@cinedash.com>";

interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: {
    id: string;
    user_id: string;
    title: string;
    year: string | null;
    poster_path: string | null;
    note: string | null;
    created_at: string;
  };
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const { record } = payload;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", record.user_id)
      .single();

    const userName = profile?.display_name ?? "Usuário desconhecido";
    const movieYear = record.year ? ` (${record.year})` : "";
    const posterImage = record.poster_path
      ? `<img src="https://image.tmdb.org/t/p/w185${record.poster_path}" alt="${record.title}" style="border-radius:8px;" />`
      : "";
    const noteHtml = record.note
      ? `<p style="color:#888;font-style:italic;">"${record.note}"</p>`
      : "";

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 16px;">Novo pedido no CineDash</h2>
        <div style="display:flex;gap:16px;align-items:flex-start;">
          ${posterImage}
          <div>
            <p style="margin:0;font-size:18px;font-weight:600;">${record.title}${movieYear}</p>
            <p style="margin:8px 0 0;color:#888;">Pedido por <strong>${userName}</strong></p>
            ${noteHtml}
          </div>
        </div>
        <hr style="margin:24px 0;border:none;border-top:1px solid #333;" />
        <p style="color:#888;font-size:13px;">Acesse o painel admin para gerenciar este pedido.</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [ADMIN_EMAIL],
        subject: `Novo pedido: ${record.title}${movieYear}`,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
