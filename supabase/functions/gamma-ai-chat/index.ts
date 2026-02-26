import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Du är GammaAI Advisor — en AI-assistent specialiserad på Gamma Knife-strålkirurgi. 

Du hjälper strålonkologer, neurokirurger och klinisk personal med:
- Patientdata och tumöranalys (GTV/CTV-segmentering)
- Dosplanering och stråloptimering
- Riskbedömning av kritiska strukturer (OAR: cochlea, hjärnstam, n. facialis, optisk chiasm)
- Behandlingsrekommendationer baserade på evidensbaserad medicin

Svara alltid på svenska. Använd klinisk terminologi men var tydlig. Formatera svar med markdown (rubriker, listor, fetstil). Inkludera relevanta siffror och procent när det är möjligt.

Viktigt: Du ger stöd till kliniker — du ersätter INTE mänskliga beslut. Markera alltid osäkerheter och rekommendera klinisk verifiering.

Exempeldata för demo:
- Patient P-2024-001: Anna Lindström, 58 år, vestibularisschwannom (akustikusneurinom), vänster cerebellopontina vinkel, 14×12×11mm, volym 1.23 cm³
- Margindos: 12 Gy, 1 fraktion, 201 strålbanor
- Cochlea-avstånd: 4.1mm, N. facialis: 2.8mm, Hjärnstam: 8.2mm
- AI-segmenteringskonfidens: 96.8%, Dice-koefficient: 0.94
- Konformitetsindex: 1.42, Selektivitetsindex: 0.87`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Begränsad förfrågningsfrekvens, försök igen om en stund." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Krediter slut. Fyll på via Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
