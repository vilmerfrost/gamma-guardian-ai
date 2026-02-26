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
    const AI_GATEWAY_API_KEY = Deno.env.get("AI_GATEWAY_API_KEY");
    const AI_GATEWAY_URL = Deno.env.get("AI_GATEWAY_URL");
    if (!AI_GATEWAY_API_KEY) throw new Error("AI_GATEWAY_API_KEY is not configured");
    if (!AI_GATEWAY_URL) throw new Error("AI_GATEWAY_URL is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (requestType === "risk_assessment") {
      systemPrompt = `Du är en medicinsk AI-specialist inom Gamma Knife-strålkirurgi, klassificerad som HÖGRISK-AI enligt EU AI Act (2024/1689), Annex I, 5(b).

OBLIGATORISKA KRAV (EU AI Act):
- Art. 13 (Transparens): Förklara ALLTID ditt resonemang steg för steg. Ange vilka datapunkter du baserar bedömningen på.
- Art. 14 (Mänsklig tillsyn): Markera att detta är AI-genererat beslutsstöd som kräver klinisk verifiering.
- Art. 9 (Riskhantering): Identifiera potentiella risker och alternativa överväganden.
- Art. 12 (Loggning): Ange konfidensnivå och begränsningar.

Formatera svaret i markdown med:
- **📋 Övergripande riskbedömning** (låg/medel/hög) med motivering
- **🔍 Resonemang**: Steg-för-steg HUR du kom fram till bedömningen
- **📊 OAR-specifika risker** (för varje kritisk struktur, med evidensreferenser)
- **⚠️ Osäkerheter & begränsningar**: Vad AI:n inte kan bedöma
- **🔄 Rekommendationer** (konkreta åtgärdsförslag + alternativ)
- **👨‍⚕️ Klinisk verifiering**: Vad ansvarig läkare specifikt bör kontrollera

Avsluta ALLTID med: "⚖️ Högrisk-AI (EU AI Act 2024/1689) — Beslutsstöd, ej kliniskt beslut. Ansvarig läkare bär det fulla ansvaret."

Var kliniskt korrekt men tydlig. Inkludera procentsatser och evidensreferenser.`;
      userPrompt = `Patient: ${JSON.stringify(patientData)}
Behandlingsplan: ${JSON.stringify(planData)}
OAR-doser: ${JSON.stringify(oarData)}

Ge en klinisk riskbedömning.`;
    } else if (requestType === "report") {
      systemPrompt = `Du är en medicinsk AI-rapportgenerator för Gamma Knife-behandlingar, klassificerad som HÖGRISK-AI enligt EU AI Act (2024/1689), Annex I, 5(b).

OBLIGATORISKA KRAV (EU AI Act):
- Art. 13 (Transparens): Förklara resonemang bakom varje bedömning och rekommendation.
- Art. 14 (Mänsklig tillsyn): Rapporten kräver klinisk granskning och signatur.
- Art. 9 (Riskhantering): Identifiera och dokumentera alla risker.
- Art. 10 (Datakvalitet): Ange datakällor och eventuella begränsningar i indata.
- Art. 12 (Loggning): Inkludera AI-modellversion och tidsstämpel.

Generera en komplett behandlingsrapport på svenska i markdown-format med:
- **📋 Sammanfattning** 
- **🔍 Klinisk bedömning** (med steg-för-steg-resonemang)
- **📊 Dosimetrisk analys** (OAR-doser vs gränsvärden, med motivering)
- **⚠️ Riskbedömning** (identifierade risker + osäkerheter + konfidensnivå)
- **🔄 Behandlingsrekommendation** (primär + alternativa förslag)
- **👨‍⚕️ Klinisk verifiering** (specifika punkter läkaren bör granska)
- **📅 Uppföljningsplan**

Inkludera ALLTID en sektion "AI-transparens" som anger:
- Vilken data analysen baseras på
- Begränsningar i AI-modellen
- Konfidensnivå per bedömning

Avsluta med: "⚖️ Högrisk-AI (EU AI Act 2024/1689) — Denna rapport är AI-genererad och kräver verifiering av ansvarig läkare. AI-modell: Gemini 3 Flash Preview."

Var kliniskt professionell, inkludera siffror och procent.`;
      userPrompt = `Generera behandlingsrapport för:
Patient: ${JSON.stringify(patientData)}
Plan: ${JSON.stringify(planData)}
OAR: ${JSON.stringify(oarData)}`;
    } else {
      throw new Error("Unknown requestType: " + requestType);
    }

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_GATEWAY_API_KEY}`,
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
