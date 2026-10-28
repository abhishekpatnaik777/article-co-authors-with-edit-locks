import Link from "next/link";

import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const instant = false;

export default async function ArticlesPage() {
  await requireUser();

  const articles = await prisma.article.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="stack-lg">
      <div className="page-title-row">
        <div>
          <h1>Articles</h1>
          <p className="subtle">All signed-in users can view every article.</p>
        </div>
        <Link href="/articles/new" className="button button-primary">
          New article
        </Link>
      </div>
      <div className="article-list">
        {articles.map((article: { id: string; title: string; updatedAt: Date; author: { name: string } }) => (
          <article key={article.id} className="card article-card">
            <div className="stack-sm">
              <Link href={`/articles/${article.id}`} className="article-link">
                <h2>{article.title}</h2>
              </Link>
              <p className="subtle">Original author: {article.author.name}</p>
              <p className="subtle">Updated {formatDate(article.updatedAt)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}