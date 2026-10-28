import { notFound, redirect } from "next/navigation";

import { canEditArticle } from "@/lib/articles";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

import { EditArticleShell } from "@/components/edit-article-shell";

export const instant = false;

export default async function EditArticlePage({ params }: PageProps<"/articles/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;

  const { article, canEdit } = await canEditArticle(id, user.id);

  if (!article) {
    notFound();
  }

  if (!canEdit) {
    redirect(`/articles/${id}`);
  }

  const users = await prisma.user.findMany({
    where: { id: { not: user.id } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <section className="stack-lg">
      <div>
        <h1>Edit article</h1>
        <p className="subtle">Only the lock owner can save changes.</p>
      </div>
      <EditArticleShell
        articleId={article.id}
        defaultValues={{
          title: article.title,
          body: article.body,
          coAuthorIds: article.coAuthors
            .map((coAuthor: { userId: string }) => coAuthor.userId)
            .filter((entry: string) => entry !== user.id),
        }}
        users={users}
        initialError={null}
      />
    </section>
  );
}