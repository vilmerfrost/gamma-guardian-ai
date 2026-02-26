import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { patientData, planData, oarData, requestType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (requestType === "risk_assessment") {
      systemPrompt = `Du är en medicinsk AI-specialist inom Gamma Knife-strålkirurgi. 
Analysera patientdata och OAR-avstånd och ge en strukturerad riskbedömning på svenska.
Formatera svaret i markdown med:
- **Övergripande riskbedömning** (låg/medel/hög)
- **OAR-specifika risker** (för varje kritisk struktur)
- **Rekommendationer** (konkreta åtgärdsförslag)
- **Konfidensnivå** (hur säker AI:n är)
Var kliniskt korrekt men tydlig. Inkludera procentsatser och evidensreferenser.`;
      userPrompt = `Patient: ${JSON.stringify(patientData)}
Behandlingsplan: ${JSON.stringify(planData)}
OAR-doser: ${JSON.stringify(oarData)}

Ge en klinisk riskbedömning.`;
    } else if (requestType === "report") {
      systemPrompt = `Du är en medicinsk AI-rapportgenerator för Gamma Knife-behandlingar.
Generera en komplett behandlingsrapport på svenska i markdown-format med:
- **Sammanfattning** 
- **Klinisk bedömning**
- **Dosimetrisk analys** (inklusive OAR-doser vs gränsvärden)
- **Riskbedömning**
- **Behandlingsrekommendation**
- **Uppföljningsplan**
Var kliniskt professionell, inkludera siffror och procent.`;
      userPrompt = `Generera behandlingsrapport för:
Patient: ${JSON.stringify(patientData)}
Plan: ${JSON.stringify(planData)}
OAR: ${JSON.stringify(oarData)}`;
    } else {
      throw new Error("Unknown requestType: " + requestType);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit — försök igen om en stund." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Krediter slut." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
