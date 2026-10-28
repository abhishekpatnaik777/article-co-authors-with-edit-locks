import { prisma } from "@/lib/prisma";
import { LOCK_TTL_MS } from "@/lib/config";

export async function canEditArticle(articleId: string, userId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { coAuthors: true },
  });

  if (!article) {
    return { article: null, canEdit: false };
  }

  const canEdit =
    article.authorId === userId || article.coAuthors.some((coAuthor: { userId: string }) => coAuthor.userId === userId);

  return { article, canEdit };
}

export function isLockStale(lastSeenAt: Date) {
  return Date.now() - lastSeenAt.getTime() > LOCK_TTL_MS;
}