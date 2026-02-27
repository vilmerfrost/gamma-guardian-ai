import LegalPageLayout from "./LegalPageLayout";

export default function AboutPage() {
  return (
    <LegalPageLayout title="About Gamma Guardian AI" lastUpdated="February 27, 2026">
      <p>
        Gamma Guardian AI is a clinical decision-support platform built to assist radiation teams with image analysis,
        contouring support, treatment planning workflows, and reporting.
      </p>

      <h2>What we do</h2>
      <ul>
        <li>Support MRI/CT image review and segmentation workflows.</li>
        <li>Assist treatment planning and documentation tasks.</li>
        <li>Provide traceable audit events for quality and compliance processes.</li>
      </ul>

      <h2>Intended users</h2>
      <p>
        The platform is intended for trained healthcare professionals and clinical teams. It is not intended for
        self-diagnosis, self-treatment, or direct patient-facing medical advice.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about legal terms or data practices can be sent to your designated Gamma Guardian AI administrator.
      </p>
    </LegalPageLayout>
  );
}
