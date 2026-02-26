

# Analys: Nuvarande implementeringsnivå vs. kliniska krav

## Sammanfattning

Appen är en **visuellt imponerande UI-prototyp** men saknar verklig funktionalitet bakom gränssnittet. Allt är hårdkodat mock-data utan faktisk bearbetning. Nedan en ärlig bedömning per nyckelkrav.

---

## 1. Autosegmentering av Tumör & OAR

**Nuvarande nivå: UI-mockup (0% funktionell)**

| Krav | Status | Detalj |
|------|--------|--------|
| Sub-millimeter precision (Dice >90%) | Saknas helt | Inga ML-modeller, ingen bildinläsning. SVG-ellipser ritas med fasta koordinater |
| Multimodal MR/CT-fusion | Saknas helt | Ingen bilduppladdning fungerar — ingen DICOM-parser, inget bildformat stöds |
| Human-in-the-loop (dra/finjustera konturer) | Saknas helt | Konturer är statiska SVG-element, ej interaktiva |
| Jämförelse med tidigare bilder | Visuell mock | Compare-mode visar två datumstämplar men ingen faktisk bildjämförelse |
| 3D-visualisering | CSS-mock | 3D-vyn är CSS `transform: preserve-3d` på div-element, inte volymrendering |

**Vad som krävs för verklig funktion:**
- DICOM/NIfTI-parser (t.ex. cornerstone.js eller AMI.js)
- ML-segmenteringsmodell (U-Net/nnU-Net) deployad som backend-tjänst
- Interaktiv kontur-editor (canvas/WebGL med kontrollpunkter)
- Volymrendering med Three.js eller VTK.js

---

## 2. Automatiserad Dos- & Strålningsplanering

**Nuvarande nivå: Statisk UI med sliders (5% funktionell)**

| Krav | Status | Detalj |
|------|--------|--------|
| BED/biologisk optimering | Saknas | Sliders ändrar bara siffror i UI, ingen beräkning sker |
| Fler-måls-hantering (multipla metastaser) | Saknas | Bara en patient/tumör kan visas |
| 3 optimerade förslag ("Option Generation") | UI finns | 3 scenarion (Konservativ/Standard/Aggressiv) med hårdkodade värden — ingen optimeringsmotor |
| DVH (Dos-Volym Histogram) | Visuell mock | SVG-kurvor med fasta path-data, inte beräknade från dosdata |
| OAR-dosbegränsningar | Statisk tabell | 6 OAR med hårdkodade `currentDose`-värden som aldrig uppdateras |
| Simulering | Fake animation | "Simulera"-knappen startar en 2.5s timeout med CSS-animationer |

**Vad som krävs:**
- Dosberäkningsmotor (Monte Carlo eller pencil-beam) — typiskt extern specialiserad mjukvara
- Optimeringsalgoritm för strålbanor (kan delvis levereras med Lovable AI för enklare heuristik)
- Koppling till faktiska patientvolymer från segmenteringssteget

---

## 3. API-integration & MDR-Compliance (Spårbarhet)

**Nuvarande nivå: Placeholder-text (2% funktionell)**

| Krav | Status | Detalj |
|------|--------|--------|
| Elekta GammaPlan API-integration | Label "Ej ansluten" i Settings | Ingen faktisk API-kod eller anslutningslogik |
| PACS/DICOM | Label "Konfigurerad" | Ingen DICOM-kommunikation implementerad |
| EMR/HL7 FHIR | Label i Settings | Ingen FHIR-klient |
| Audit-log (CE/MDR) | Saknas helt | Inga loggar, ingen spårbarhet, ingen versionering av AI-beslut |
| Zero-Click import/export | Saknas | Ingen fil-IO överhuvudtaget |

---

## Vad som faktiskt fungerar idag

1. **AI Advisor Chat** — Riktigt fungerande med streaming via Lovable AI (Gemini). Kan svara på kliniska frågor på svenska.
2. **Visuell design** — Professionell medicinteknisk UI med alla sidor navigerbara.
3. **3D-vy** — Interaktiv rotation, zoom, pause (CSS-baserad, inte medicinsk volymrendering).
4. **Mock-data** — Kliniskt realistisk patientdata med relevanta fält.

---

## Plan: Realistiska förbättringar inom webapp-ramverket

Följande kan implementeras med befintlig teknologi (React + Lovable Cloud) för att göra appen mer funktionell utan att kräva extern ML-infrastruktur:

### Steg 1: Interaktiv segmentering (Human-in-the-loop)
- Gör SVG-konturer dragbara med kontrollpunkter
- Lägg till manuell ritning av konturer på canvas
- Beräkna volymer dynamiskt baserat på konturerna

### Steg 2: Funktionell dosplanering
- Implementera förenklad dosberäkning (inverse-square law) i frontend
- DVH som beräknas från dosmatrisen
- Sliders som faktiskt påverkar isodos-visualiseringen och OAR-doserna

### Steg 3: AI-driven analys via backend
- Skicka patientdata till Lovable AI för kliniska rekommendationer
- AI-genererad riskbedömning baserat på OAR-avstånd och tumörvolym
- Automatisk rapportgenerering via AI

### Steg 4: Audit-logg & spårbarhet
- Databas-tabell för alla AI-beslut med tidsstämpel, version, användare
- Logg över manuella ändringar i segmentering och dosplan
- Export av audit-trail som PDF

### Steg 5: DICOM-bildvisning
- Integrera cornerstone.js för riktig DICOM-rendering
- Overlay av segmenteringskonturer på riktiga bilder

Vill du att jag implementerar dessa steg? Jag rekommenderar att börja med **Steg 1 + 3** som ger mest synlig funktionalitet.

