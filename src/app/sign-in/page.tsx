import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";

import { SignInForm } from "./sign-in-form";

export const instant = false;

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/articles");
  }

  return (
    <main className="auth-page">
      <div className="card auth-card stack-md">
        <h1>Sign in</h1>
        <p className="subtle">Use Zolly/password or John/password.</p>
        <Suspense fallback={<p className="subtle">Loading…</p>}>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}