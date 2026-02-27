import LegalPageLayout, { LegalSectionBlock } from "./LegalPageLayout";

const sections = [
  { id: "authorized-use", label: "Authorized use" },
  { id: "clinical-responsibility", label: "Clinical responsibility" },
  { id: "availability", label: "Availability" },
  { id: "ip", label: "Intellectual property" },
  { id: "liability", label: "Liability" },
  { id: "changes", label: "Changes" },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="February 27, 2026"
      summary="These terms govern organizational and user access to Gamma Guardian AI, including acceptable use, clinical responsibility, and liability boundaries."
      sections={sections}
    >
      <LegalSectionBlock id="authorized-use" title="Authorized use">
        <ul className="list-disc pl-5 space-y-1">
          <li>Use is limited to authorized users acting within professional scope.</li>
          <li>Users must protect credentials and maintain account confidentiality.</li>
          <li>Users must not misuse, reverse engineer, or disrupt the platform.</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="clinical-responsibility" title="Clinical responsibility">
        <p>
          Platform outputs are support tools and do not replace independent professional judgment. Final diagnosis,
          treatment, and patient safety decisions remain the responsibility of licensed clinicians.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="availability" title="Availability">
        <p>
          We aim for high availability but do not guarantee uninterrupted access. Maintenance and security updates may
          affect uptime.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="ip" title="Intellectual property">
        <p>
          The platform, code, and related content are protected by applicable intellectual property laws. No rights are
          granted except as explicitly provided.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="liability" title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, liability is limited to direct damages under applicable agreements and
          excludes indirect or consequential loss.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="changes" title="Changes to terms">
        <p>We may update these terms. Continued use after updates means acceptance of the revised terms.</p>
      </LegalSectionBlock>
    </LegalPageLayout>
  );
}

