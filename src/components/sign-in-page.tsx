"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [redirectUrl, setRedirectUrl] = useState("/dashboard");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#\/?\??/, "");
    const params = new URLSearchParams(hash);
    const redirect = params.get("redirect");

    if (redirect && redirect.startsWith("/")) {
      setRedirectUrl(redirect);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-primary">Board<span className="text-accent">Room</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Nonprofit Board Governance Portal</p>
        </div>
        <SignIn fallbackRedirectUrl={redirectUrl} forceRedirectUrl={redirectUrl} />
      </div>
    </div>
  );
}
