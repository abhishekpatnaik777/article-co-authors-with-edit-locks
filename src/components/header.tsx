import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/server";

import { SignOutButton } from "@/components/sign-out-button";

export async function Header() {
  const user = await requireUser();
  const articleCount = await prisma.article.count();

  return (
    <header className="site-header">
      <div>
        <Link href="/articles" className="brand">
          Article Workspace
        </Link>
        <p className="subtle">{articleCount} article(s)</p>
      </div>
      <nav className="nav-links">
        <Link href="/articles">Articles</Link>
        <Link href="/articles/new">Create article</Link>
      </nav>
      <div className="header-user">
        <span>Signed in as {user.name}</span>
        <SignOutButton />
      </div>
    </header>
  );
}