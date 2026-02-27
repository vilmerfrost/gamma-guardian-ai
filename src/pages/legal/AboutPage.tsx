import LegalPageLayout, { LegalSectionBlock } from "./LegalPageLayout";

const sections = [
  { id: "what-we-do", label: "What we do" },
  { id: "intended-users", label: "Intended users" },
  { id: "contact", label: "Contact" },
];

export default function AboutPage() {
  return (
    <LegalPageLayout
      title="About Gamma Guardian AI"
      lastUpdated="February 27, 2026"
      summary="Gamma Guardian AI is a clinical decision-support platform for image analysis, planning workflows, and reporting support in radiosurgery environments."
      sections={sections}
    >
      <LegalSectionBlock id="what-we-do" title="What we do">
        <ul className="list-disc pl-5 space-y-1">
          <li>Support MRI/CT image review and segmentation workflows.</li>
          <li>Assist treatment planning and clinical documentation tasks.</li>
          <li>Provide traceable audit events for compliance and quality processes.</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="intended-users" title="Intended users">
        <p>
          The platform is intended for trained healthcare professionals and clinical teams. It is not intended for
          self-diagnosis, self-treatment, or direct patient-facing medical advice.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="contact" title="Contact">
        <p>
          Questions about legal terms or data practices should be sent to your designated Gamma Guardian AI
          administrator.
        </p>
      </LegalSectionBlock>
    </LegalPageLayout>
  );
}
