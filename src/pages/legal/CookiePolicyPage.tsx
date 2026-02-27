import LegalPageLayout, { LegalSectionBlock } from "./LegalPageLayout";

const sections = [
  { id: "types", label: "Cookie types" },
  { id: "purpose", label: "Purpose" },
  { id: "manage", label: "Manage cookies" },
  { id: "records", label: "Consent records" },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      lastUpdated="February 27, 2026"
      summary="This policy explains what cookies we use, why we use them, and how users can manage non-essential cookie consent."
      sections={sections}
    >
      <LegalSectionBlock id="types" title="Cookie types we use">
        <ul className="list-disc pl-5 space-y-1">
          <li>Essential cookies required for login, security, and core functionality.</li>
          <li>Preference cookies used to remember user interface choices.</li>
          <li>Optional analytics cookies, only when consent is given where required.</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="purpose" title="Why we use cookies">
        <ul className="list-disc pl-5 space-y-1">
          <li>Authenticate sessions and keep accounts secure.</li>
          <li>Store user settings and improve usability.</li>
          <li>Measure service performance and reliability.</li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="manage" title="Managing cookies">
        <p>
          You can accept or reject non-essential cookies via the cookie banner. Browser settings can also block or
          remove cookies, but this may affect platform features.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="records" title="Consent records">
        <p>
          We store your consent preference locally in your browser so your choice can be respected on future visits.
        </p>
      </LegalSectionBlock>
    </LegalPageLayout>
  );
}

