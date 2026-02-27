import LegalPageLayout from "./LegalPageLayout";

export default function MedicalDisclaimerPage() {
  return (
    <LegalPageLayout title="Medical Disclaimer" lastUpdated="February 27, 2026">
      <p>
        Gamma Guardian AI provides software assistance only. It does not provide medical advice, diagnosis, or treatment
        instructions.
      </p>

      <h2>Professional use only</h2>
      <ul>
        <li>The platform is for trained medical professionals.</li>
        <li>It is not intended for consumer, emergency, or self-care use.</li>
      </ul>

      <h2>No replacement for clinician judgment</h2>
      <p>
        All outputs must be reviewed by qualified clinicians. Final decisions and responsibility for patient care always
        remain with the treating medical team.
      </p>

      <h2>Validation and local requirements</h2>
      <p>
        Each healthcare organization is responsible for validation, protocol alignment, and regulatory obligations before
        clinical use.
      </p>
    </LegalPageLayout>
  );
}
