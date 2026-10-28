import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

import { ArticleForm } from "@/components/article-form";

export const instant = false;

export default async function NewArticlePage() {
  const user = await requireUser();

  const users = await prisma.user.findMany({
    where: { id: { not: user.id } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <section className="stack-lg">
      <div>
        <h1>Create article</h1>
        <p className="subtle">Add co-authors so others can edit with you.</p>
      </div>
      <ArticleForm mode="create" defaultValues={{ title: "", body: "", coAuthorIds: [] }} users={users} />
    </section>
  );
}