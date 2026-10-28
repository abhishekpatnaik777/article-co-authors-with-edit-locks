"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="stack-md"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const response = await fetch("/api/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.get("username"),
            password: formData.get("password"),
          }),
        });

        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          setError(payload.error ?? "Unable to sign in.");
          setLoading(false);
          return;
        }

        router.push(searchParams.get("next") ?? "/articles");
        router.refresh();
      }}
    >
      <div className="field">
        <label htmlFor="username">Username</label>
        <Input id="username" name="username" autoComplete="username" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <Input id="password" name="password" type="password" autoComplete="current-password" />
      </div>
      {error ? <p className="error-banner">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}