# One-Night MVP Build Plan

## Goal (Tonight)
Ship 3 high-impact demo features that make the product look clinically serious:

1. Plan Tradeoff Frontier
2. OAR Breach Guardrails + Auto Alternatives
3. Tumor Board One-Click Brief

## Timebox (7 Hours)

1. 00:00-00:30 setup, branch, baseline run
2. 00:30-02:15 build Tradeoff Frontier
3. 02:15-03:45 build Guardrails + Alternatives
4. 03:45-05:15 build Tumor Board Brief
5. 05:15-06:00 UX polish and loading/error states
6. 06:00-07:00 demo prep, bug sweep, production build

## Feature Scope

### 1) Plan Tradeoff Frontier
File targets:
- `src/pages/PlanningAssistant.tsx`
- optional: `src/components/planning/TradeoffFrontier.tsx`

Implementation:
- Add a `recharts` scatter chart card in Planning.
- Generate points from dose `8-25` and collimator `4-18`.
- X-axis: target coverage proxy (higher better).
- Y-axis: OAR risk proxy (lower better).
- Highlight current plan and top 3 Pareto-efficient options.
- Clicking a point updates sliders and recalculates metrics.

Acceptance criteria:
- Chart renders with current plan highlighted.
- Selecting a point updates dose/collimator controls.
- No TypeScript `any` for new code.

### 2) OAR Breach Guardrails + Auto Alternatives
File targets:
- `src/pages/PlanningAssistant.tsx`
- `src/lib/doseCalculations.ts` (if helper additions needed)

Implementation:
- Detect OAR breaches (`currentDose > maxDose`).
- Show warning banner listing breached structures.
- Auto-generate 3 alternatives:
  - Safer
  - Balanced
  - Aggressive
- Each alternative shows:
  - proposed parameters
  - one-line rationale
  - estimated CI/SI + OAR outcome
  - `Apply` button
- Log an audit event on apply.

Acceptance criteria:
- Warning appears immediately on breach.
- At least 3 alternatives appear when breach exists.
- Apply button updates controls and logs event.

### 3) Tumor Board One-Click Brief
File targets:
- `src/pages/ReportGenerator.tsx`

Implementation:
- Add button: `Generate Tumor Board Brief`.
- Build concise markdown output sections:
  - Case Snapshot
  - Plan Summary
  - OAR Risks
  - Alternatives Considered
  - Recommended Plan + Why
  - Clinician Checklist
- Reuse existing streaming approach if possible.
- Add `Copy` and print-friendly action.
- Keep existing full report flow unchanged.

Acceptance criteria:
- Brief generates and renders in markdown view.
- Copy works.
- Print layout remains readable.

## Copy-Paste AI Coding Prompts

### Prompt A: Tradeoff Frontier
```txt
Add a "Plan Tradeoff Frontier" panel to PlanningAssistant.tsx.
Use recharts ScatterChart with points generated from dose 8-25 and collimator 4-18.
X-axis: target coverage proxy (higher is better), Y-axis: OAR risk proxy (lower is better).
Highlight current plan point and top 3 Pareto-efficient alternatives.
When user clicks a point, update sliders and recalculate metrics.
Keep visual style consistent with existing card-medical components.
TypeScript strict, no any.
```

### Prompt B: Guardrails + Alternatives
```txt
Implement "OAR Breach Guardrails + Auto Alternatives" in PlanningAssistant.tsx.
If any OAR exceeds maxDose, show warning banner with breached structures.
Generate 3 alternatives by adjusting dose/collimator/fractions to reduce breach while preserving CI/SI.
Display alternatives with badges: "Safer", "Balanced", "Aggressive".
Each alternative needs a one-line rationale and an "Apply" button.
Log audit event when applying alternative.
Reuse existing calculateOARDose/calculateConformityIndex/calculateSelectivityIndex helpers.
```

### Prompt C: Tumor Board Brief
```txt
Add "Tumor Board Brief" to ReportGenerator.tsx.
Create a button that generates a concise markdown brief with sections:
- Case Snapshot
- Plan Summary
- OAR Risks
- Alternatives Considered
- Recommended Plan + Why
- Clinician Checklist
Use current patient/plan/oar data and stream output similar to existing report generation flow.
Add print-friendly layout and copy-to-clipboard button.
Do not remove existing full report flow.
```

## Git Commit Sequence

1. `feat/planning-tradeoff-frontier`
2. `feat/planning-oar-guardrails`
3. `feat/reports-tumor-board-brief`
4. `chore/demo-polish-and-bugfix`

## Final Validation Checklist

1. `npm run lint`
2. `npm run test`
3. `npm run build`
4. Walk through 5-minute demo flow end-to-end

## 5-Min Demo Flow

1. Planning: move sliders and show frontier changes in real time.
2. Planning: force OAR breach, show alternatives, apply one.
3. Reports: generate Tumor Board Brief, copy, then print preview.

