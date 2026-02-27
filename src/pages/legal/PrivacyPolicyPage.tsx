import LegalPageLayout, { LegalSectionBlock } from "./LegalPageLayout";

const sections = [
  { id: "data-we-process", label: "Data we process" },
  { id: "purpose", label: "Purpose" },
  { id: "legal-basis", label: "Legal basis" },
  { id: "sharing", label: "Data sharing" },
  { id: "retention", label: "Retention" },
  { id: "rights", label: "Your rights" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="February 27, 2026"
      summary="This policy explains what personal data we process, why we process it, and how users can exercise privacy rights through their organization."
      sections={sections}
    >
      <LegalSectionBlock id="data-we-process" title="Data we process">
        <ul className="list-disc pl-5 space-y-1">
          <li>Account data such as email and user profile metadata.</li>
          <li>Operational data such as actions, settings, and audit logs.</li>
          <li>Clinical files uploaded by authorized users, including DICOM/NIfTI content.</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="purpose" title="Purpose of processing">
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide platform functionality and secure access.</li>
          <li>Support clinical workflow features requested by authorized users.</li>
          <li>Maintain security, traceability, and service reliability.</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="legal-basis" title="Legal basis">
        <p>
          Processing is based on legitimate interest, contractual necessity, legal obligations, and where required,
          explicit consent handled by your organization.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="sharing" title="Data sharing">
        <p>
          We share data only with approved service providers and infrastructure partners required to deliver the
          service, subject to contractual and security safeguards.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="retention" title="Retention">
        <p>
          Data is retained only as long as needed for service delivery, compliance, and audit obligations, then deleted
          or anonymized according to policy.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="rights" title="Your rights">
        <p>
          Depending on jurisdiction, users may have rights to access, correct, delete, restrict, or export personal
          data. Requests should be made through your organization administrator.
        </p>
      </LegalSectionBlock>
    </LegalPageLayout>
  );
}
