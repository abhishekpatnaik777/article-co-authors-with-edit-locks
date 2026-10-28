"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Button
      variant="secondary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/sign-out", { method: "POST" });
        } finally {
          setLoading(false);
        }
        router.push("/sign-in");
        router.refresh();
      }}
    >
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
