import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/server";
import { canEditArticle } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const instant = false;

export default async function ArticleDetailPage({ params }: PageProps<"/articles/[id]">) {
  const user = await requireUser();
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!article) {
    notFound();
  }

  const { canEdit } = await canEditArticle(id, user.id);

  return (
    <section className="stack-lg">
      <div className="page-title-row">
        <div>
          <h1>{article.title}</h1>
          <p className="subtle">Original author: {article.author.name}</p>
          <p className="subtle">Updated {formatDate(article.updatedAt)}</p>
        </div>
        {canEdit ? (
          <Link href={`/articles/${article.id}/edit`} className="button button-primary">
            Edit article
          </Link>
        ) : null}
      </div>
      <article className="card article-body">
        <p>{article.body}</p>
      </article>
    </section>
  );
}