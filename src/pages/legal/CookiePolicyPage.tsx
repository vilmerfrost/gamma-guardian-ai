import LegalPageLayout from "./LegalPageLayout";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="February 27, 2026">
      <p>
        This Cookie Policy explains how Gamma Guardian AI uses cookies and similar technologies on this website and
        application.
      </p>

      <h2>What we use</h2>
      <ul>
        <li>Essential cookies required for login, security, and core functionality.</li>
        <li>Preference cookies used to remember user interface choices.</li>
        <li>Optional analytics cookies, only when consent is given where required.</li>
      </ul>

      <h2>Why we use cookies</h2>
      <ul>
        <li>Authenticate sessions and keep accounts secure.</li>
        <li>Store user settings and improve usability.</li>
        <li>Measure service performance and reliability.</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>
        You can accept or reject non-essential cookies via the cookie banner. Browser settings can also block or remove
        cookies, but this may affect platform features.
      </p>

      <h2>Consent records</h2>
      <p>
        We store your consent preference locally in your browser so your choice can be respected on future visits.
      </p>
    </LegalPageLayout>
  );
}
