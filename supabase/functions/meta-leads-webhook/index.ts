import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WhatsAppConfig {
  id: string;
  server_url: string;
  api_key: string;
  instance_name: string;
  phone_to: string;
  phones_to: string[];
  message_template: string;
  trigger_type: "page_id" | "ad_account_id" | "form_id";
  trigger_value: string;
  is_active: boolean;
}

async function sendWhatsAppToNumber(
  cfg: WhatsAppConfig,
  phoneNumber: string,
  lead: { name: string; email: string; phone: string; campaign_name: string }
) {
  try {
    const message = cfg.message_template
      .replace(/{{nome}}/g, lead.name || "—")
      .replace(/{{email}}/g, lead.email || "—")
      .replace(/{{telefone}}/g, lead.phone || "—")
      .replace(/{{campanha}}/g, lead.campaign_name || "—");

    const base = cfg.server_url.replace(/\/$/, "");
    const res = await fetch(`${base}/message/sendText/${cfg.instance_name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.api_key,
      },
      body: JSON.stringify({ number: phoneNumber, text: message }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Erro ao enviar WhatsApp para ${phoneNumber}:`, errText);
      return false;
    }

    console.log(`WhatsApp enviado para ${phoneNumber} (instância: ${cfg.instance_name})`);
    return true;
  } catch (e) {
    console.error("Exceção ao enviar WhatsApp:", e);
    return false;
  }
}

async function sendWhatsApp(
  cfg: WhatsAppConfig,
  lead: { name: string; email: string; phone: string; campaign_name: string }
) {
  // Suporte a múltiplos números: phones_to tem prioridade, fallback para phone_to
  const numbers: string[] = cfg.phones_to?.length ? cfg.phones_to : cfg.phone_to ? [cfg.phone_to] : [];
  if (numbers.length === 0) {
    console.warn(`Rota ${cfg.id} não tem números configurados`);
    return false;
  }
  const results = await Promise.all(numbers.map((n) => sendWhatsAppToNumber(cfg, n, lead)));
  return results.some(Boolean);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ─── GET: verificação do webhook pelo Meta ────────────────────────────────────
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const challenge = url.searchParams.get("hub.challenge");
    const tokenParam = url.searchParams.get("hub.verify_token");

    if (mode !== "subscribe" || !tokenParam || !challenge) {
      return new Response("Bad Request", { status: 400, headers: corsHeaders });
    }

    const { data: config } = await supabase
      .from("meta_ads_config")
      .select("verify_token")
      .eq("is_active", true)
      .maybeSingle();

    if (!config || config.verify_token !== tokenParam) {
      console.error("Verify token inválido:", tokenParam);
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    console.log("Webhook verificado com sucesso");
    return new Response(challenge, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }

  // ─── POST: recebimento de leads ───────────────────────────────────────────────
  if (req.method === "POST") {
    // Verifica assinatura HMAC do Meta para prevenir payloads forjados
    const appSecret = Deno.env.get("META_APP_SECRET");
    if (!appSecret) {
      console.error("META_APP_SECRET não configurado");
      return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
    }
    const sigHeader = req.headers.get("x-hub-signature-256") ?? "";
    const rawBody = await req.arrayBuffer();
    try {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(appSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const macBuf = await crypto.subtle.sign("HMAC", key, rawBody);
      const expected = "sha256=" + Array.from(new Uint8Array(macBuf))
        .map((b) => b.toString(16).padStart(2, "0")).join("");
      // Comparação em tempo constante
      if (sigHeader.length !== expected.length) {
        return new Response("Forbidden", { status: 403, headers: corsHeaders });
      }
      let diff = 0;
      for (let i = 0; i < expected.length; i++) {
        diff |= expected.charCodeAt(i) ^ sigHeader.charCodeAt(i);
      }
      if (diff !== 0) {
        return new Response("Forbidden", { status: 403, headers: corsHeaders });
      }
    } catch (e) {
      console.error("Falha ao verificar assinatura:", e);
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(new TextDecoder().decode(rawBody));
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payload recebido do Meta:", JSON.stringify(body));

    const entries = (body as { entry?: unknown[] }).entry ?? [];
    const leadsToInsert: Record<string, unknown>[] = [];

    for (const entry of entries as Record<string, unknown>[]) {
      const changes = (entry.changes as Record<string, unknown>[]) ?? [];
      for (const change of changes) {
        if (change.field !== "leadgen") continue;

        const value = change.value as Record<string, unknown>;
        const leadgenId = value.leadgen_id as string;
        const pageId = value.page_id as string;
        const adId = value.ad_id as string;
        const formId = value.form_id as string;
        const adAccountId = value.adgroup_id as string;
        const campaignId = value.campaign_id as string;

        let name = "";
        let email = "";
        let phone = "";
        let campaignName = "";

        // Busca dados detalhados do lead via Graph API
        const accessToken = Deno.env.get("META_ADS_ACCESS_TOKEN");
        if (accessToken && leadgenId) {
          try {
            const resp = await fetch(
              `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${accessToken}`
            );
            if (resp.ok) {
              const leadData = await resp.json() as {
                field_data?: { name: string; values: string[] }[];
                campaign_name?: string;
              };
              const fields = leadData.field_data ?? [];
              for (const field of fields) {
                const val = field.values?.[0] ?? "";
                const fn = field.name.toLowerCase();
                if (fn.includes("name") || fn === "full_name") name = val;
                else if (fn === "email") email = val;
                else if (fn === "phone_number" || fn === "phone") phone = val;
              }
              campaignName = leadData.campaign_name ?? "";
            }
          } catch (e) {
            console.error("Erro ao buscar dados do lead:", e);
          }
        }

        const leadRecord = {
          name,
          email,
          phone,
          campaign_name: campaignName,
          campaign_id: campaignId ?? null,
          ad_id: adId ?? null,
          form_id: formId ?? null,
          page_id: pageId ?? null,
          ad_account_id: adAccountId ?? null,
          source: "meta_ads",
          status: "pending",
          raw_payload: value,
        };

        leadsToInsert.push(leadRecord);

        // ─── Dispatch WhatsApp ────────────────────────────────────────────────────
        // Busca todas as rotas ativas e filtra por page_id ou ad_account_id
        const { data: whatsappConfigs } = await supabase
          .from("whatsapp_configs")
          .select("*")
          .eq("is_active", true) as { data: WhatsAppConfig[] | null };

        if (whatsappConfigs && whatsappConfigs.length > 0) {
          const matchingConfigs = whatsappConfigs.filter((cfg) => {
            if (cfg.trigger_type === "page_id" && pageId) {
              return cfg.trigger_value === pageId;
            }
            if (cfg.trigger_type === "ad_account_id" && adAccountId) {
              return cfg.trigger_value === adAccountId;
            }
            if (cfg.trigger_type === "form_id" && formId) {
              return cfg.trigger_value === formId;
            }
            return false;
          });

          if (matchingConfigs.length > 0) {
            console.log(`Encontradas ${matchingConfigs.length} rota(s) de WhatsApp para este lead`);
            for (const cfg of matchingConfigs) {
              await sendWhatsApp(cfg, { name, email, phone, campaign_name: campaignName });
            }
            // Atualiza status do lead para 'sent' se pelo menos uma rota funcionou
            leadRecord.status = "sent";
          } else {
            console.log("Nenhuma rota de WhatsApp encontrada para page_id:", pageId, "ou ad_account_id:", adAccountId);
          }
        }
      }
    }

    if (leadsToInsert.length > 0) {
      const { error } = await supabase.from("leads").insert(leadsToInsert);
      if (error) {
        console.error("Erro ao inserir leads:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`${leadsToInsert.length} lead(s) inserido(s) com sucesso`);
    } else {
      console.log("Nenhum lead encontrado no payload");
    }

    return new Response(
      JSON.stringify({ received: true, leads_count: leadsToInsert.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
});
