import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "gamma_cookie_consent_v1";

interface ConsentState {
  analytics: boolean;
  timestamp: string;
}

function saveConsent(analytics: boolean) {
  const value: ConsentState = {
    analytics,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = localStorage.getItem(CONSENT_KEY);
    setVisible(!existing);
  }, []);

  const acceptAll = () => {
    saveConsent(true);
    setVisible(false);
  };

  const essentialOnly = () => {
    saveConsent(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:max-w-md">
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur p-4 shadow-lg">
        <p className="text-sm font-semibold text-foreground">Cookie preferences</p>
        <p className="mt-1 text-xs text-muted-foreground">
          We use essential cookies for login and security. Optional analytics cookies are only used with your consent.
        </p>
        <p className="mt-2 text-xs">
          <Link to="/cookies" className="text-primary hover:underline">
            Read Cookie Policy
          </Link>
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" onClick={acceptAll}>Accept all</Button>
          <Button size="sm" variant="outline" onClick={essentialOnly}>Essential only</Button>
        </div>
      </div>
    </div>
  );
}
