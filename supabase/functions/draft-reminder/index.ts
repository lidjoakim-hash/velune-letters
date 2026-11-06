// Velune Letters · draft-reminder
// Once a day: couples who designed a draft 1–7 days ago but never published get ONE friendly email
// with a link back to their draft. Runs from pg_cron (see draft-reminder.sql).
// Secrets needed: RESEND_API_KEY, MAIL_FROM, SITE_URL (same as notify-rsvp).

const COPY: Record<string, [string, string, string, string]> = {
  en: ["Your invitation is waiting", "Your invitation for {c} is saved exactly as you left it. Guests can open it the moment you send it.", "Open my invitation", "Questions? Just reply to this email."],
  ro: ["Invitația voastră vă așteaptă", "Invitația pentru {c} este salvată exact cum ați lăsat-o. Invitații o pot deschide imediat ce o trimiteți.", "Deschide invitația", "Întrebări? Răspundeți la acest email."],
  no: ["Invitasjonen deres venter", "Invitasjonen for {c} er lagret akkurat slik dere forlot den. Gjestene kan åpne den så snart dere sender den.", "Åpne invitasjonen", "Spørsmål? Bare svar på denne e-posten."],
  it: ["Il vostro invito vi aspetta", "L'invito per {c} è salvato esattamente come l'avete lasciato. Gli ospiti possono aprirlo appena lo inviate.", "Apri il mio invito", "Domande? Rispondete a questa email."],
};

Deno.serve(async () => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND = Deno.env.get("RESEND_API_KEY");
  const FROM = Deno.env.get("MAIL_FROM") || "Velune Letters <onboarding@resend.dev>";
  const SITE = (Deno.env.get("SITE_URL") || "").replace(/\/$/, "");
  if (!RESEND) return new Response("no RESEND_API_KEY, skipping");
  const h = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

  const day = 864e5, now = Date.now();
  const from = new Date(now - 7 * day).toISOString(), to = new Date(now - day).toISOString();
  const rows = await (await fetch(`${SUPABASE_URL}/rest/v1/invitations?status=eq.draft&paid_at=is.null&reminded_at=is.null&created_at=gte.${from}&created_at=lte.${to}&select=id,owner,slug,data&limit=100`, { headers: h })).json();
  const esc = (s: string) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
  let sent = 0;
  for (const inv of Array.isArray(rows) ? rows : []) {
    const user = await (await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${inv.owner}`, { headers: h })).json();
    if (user?.email) {
      const L = COPY[inv.data?.lang] || COPY.en;
      const couple = `${esc(inv.data?.p1 || "")} & ${esc(inv.data?.p2 || "")}`;
      const link = `${SITE}/studio.html?id=${inv.id}&utm_source=email&utm_campaign=draft-reminder`;
      const html = `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#2a1c22;max-width:520px;margin:auto;padding:24px">
        <p style="font-size:22px;margin:0 0 12px">${L[0]}</p>
        <p>${L[1].replace("{c}", `<b>${couple}</b>`)}</p>
        <p><a href="${link}" style="display:inline-block;background:#8E4A5C;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px">${L[2]}</a></p>
        <p style="color:#77636A;font-size:14px">${L[3]}<br>Velune Letters · <a href="https://www.instagram.com/lettersbyvelune/" style="color:#77636A">@lettersbyvelune</a></p></div>`;
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: user.email, subject: `${L[0]} 💌`, html }) });
      if (r.ok) sent++;
    }
    await fetch(`${SUPABASE_URL}/rest/v1/invitations?id=eq.${inv.id}`, { method: "PATCH", headers: h, body: JSON.stringify({ reminded_at: new Date().toISOString() }) });
  }
  return new Response(`sent ${sent}`);
});
