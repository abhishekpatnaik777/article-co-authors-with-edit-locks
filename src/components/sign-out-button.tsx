"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="secondary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/sign-out", { method: "POST" });
        router.push("/sign-in");
        router.refresh();
      }}
    >
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}