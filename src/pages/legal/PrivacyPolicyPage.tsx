import LegalPageLayout from "./LegalPageLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="February 27, 2026">
      <p>
        This Privacy Policy explains how Gamma Guardian AI processes personal data when users access and operate the
        platform.
      </p>

      <h2>Data we process</h2>
      <ul>
        <li>Account data such as email and user profile metadata.</li>
        <li>Operational data such as actions, settings, and audit logs.</li>
        <li>Clinical files uploaded by authorized users, including DICOM/NIfTI content.</li>
      </ul>

      <h2>Purpose of processing</h2>
      <ul>
        <li>Provide platform functionality and secure access.</li>
        <li>Support clinical workflow features requested by authorized users.</li>
        <li>Maintain security, traceability, and service reliability.</li>
      </ul>

      <h2>Legal basis</h2>
      <p>
        Processing is based on legitimate interest, contractual necessity, legal obligations, and where required,
        explicit consent handled by your organization.
      </p>

      <h2>Data sharing</h2>
      <p>
        We share data only with approved service providers and infrastructure partners required to deliver the service,
        subject to contractual and security safeguards.
      </p>

      <h2>Retention</h2>
      <p>
        Data is retained only as long as needed for service delivery, compliance, and audit obligations, then deleted or
        anonymized according to policy.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on jurisdiction, users may have rights to access, correct, delete, restrict, or export personal data.
        Requests should be made through your organization administrator.
      </p>
    </LegalPageLayout>
  );
}
