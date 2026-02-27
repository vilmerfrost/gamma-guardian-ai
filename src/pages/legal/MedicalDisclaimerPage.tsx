import LegalPageLayout, { LegalSectionBlock } from "./LegalPageLayout";

const sections = [
  { id: "scope", label: "Scope" },
  { id: "professional-use", label: "Professional use" },
  { id: "clinical-judgment", label: "Clinical judgment" },
  { id: "validation", label: "Validation" },
];

export default function MedicalDisclaimerPage() {
  return (
    <LegalPageLayout
      title="Medical Disclaimer"
      lastUpdated="February 27, 2026"
      summary="Gamma Guardian AI provides decision-support functionality only and must be used under qualified clinical supervision."
      sections={sections}
    >
      <LegalSectionBlock id="scope" title="Scope of the platform">
        <p>
          Gamma Guardian AI provides software assistance only. It does not provide medical advice, diagnosis, or
          treatment instructions.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="professional-use" title="Professional use only">
        <ul className="list-disc pl-5 space-y-1">
          <li>The platform is for trained medical professionals.</li>
          <li>It is not intended for consumer, emergency, or self-care use.</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="clinical-judgment" title="No replacement for clinician judgment">
        <p>
          All outputs must be reviewed by qualified clinicians. Final decisions and responsibility for patient care
          always remain with the treating medical team.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="validation" title="Validation and local requirements">
        <p>
          Each healthcare organization is responsible for validation, protocol alignment, and regulatory obligations
          before clinical use.
        </p>
      </LegalSectionBlock>
    </LegalPageLayout>
  );
}
