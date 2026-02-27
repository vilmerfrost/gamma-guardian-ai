import LegalPageLayout from "./LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="February 27, 2026">
      <p>
        These Terms of Service govern access to and use of Gamma Guardian AI. By using the platform, your organization
        and authorized users agree to these terms.
      </p>

      <h2>Authorized use</h2>
      <ul>
        <li>Use is limited to authorized users acting within professional scope.</li>
        <li>Users must protect credentials and maintain account confidentiality.</li>
        <li>Users must not misuse, reverse engineer, or disrupt the platform.</li>
      </ul>

      <h2>Clinical responsibility</h2>
      <p>
        Platform outputs are support tools and do not replace independent professional judgment. Final diagnosis,
        treatment, and patient safety decisions remain the responsibility of licensed clinicians.
      </p>

      <h2>Availability</h2>
      <p>
        We aim for high availability but do not guarantee uninterrupted access. Maintenance and security updates may
        affect uptime.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The platform, code, and related content are protected by applicable intellectual property laws. No rights are
        granted except as explicitly provided.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, liability is limited to direct damages under applicable agreements and
        excludes indirect or consequential loss.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. Continued use after updates means acceptance of the revised terms.
      </p>
    </LegalPageLayout>
  );
}
