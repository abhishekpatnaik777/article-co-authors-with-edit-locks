import { NextResponse } from "next/server";

import { canEditArticle, isLockStale } from "@/lib/articles";
import { requireApiUser } from "@/lib/auth/api";
import { prisma } from "@/lib/prisma";
import { articleSchema, lockSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: RouteContext<"/api/articles/[id]">) {
  const result = await requireApiUser();

  if ("error" in result) {
    return result.error;
  }

  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: true,
      coAuthors: { include: { user: true } },
      lock: { include: { lockedByUser: true } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PUT(request: Request, { params }: RouteContext<"/api/articles/[id]">) {
  const result = await requireApiUser();

  if ("error" in result) {
    return result.error;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const articleParsed = articleSchema.safeParse(body);
  const lockParsed = lockSchema.safeParse(body);

  if (!articleParsed.success || !lockParsed.success) {
    return NextResponse.json({ error: "Invalid article payload." }, { status: 400 });
  }

  const permission = await canEditArticle(id, result.user.id);

  if (!permission.article) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  if (!permission.canEdit) {
    return NextResponse.json({ error: "You are not allowed to edit this article." }, { status: 403 });
  }

  const lock = await prisma.articleLock.findUnique({
    where: { articleId: id },
  });

  if (
    !lock ||
    lock.lockedByUserId !== result.user.id ||
    lock.clientId !== lockParsed.data.clientId ||
    isLockStale(lock.lastSeenAt)
  ) {
    return NextResponse.json({ error: "You lost the edit lock. Please refresh to continue." }, { status: 409 });
  }

  const coAuthorIds = new Set(articleParsed.data.coAuthorIds.filter((userId) => userId !== permission.article!.authorId));

  // Co-authors are omitted from the picker while editing; keep their own row on save.
  if (permission.article.authorId !== result.user.id) {
    coAuthorIds.add(result.user.id);
  }

  await prisma.article.update({
    where: { id },
    data: {
      title: articleParsed.data.title,
      body: articleParsed.data.body,
      coAuthors: {
        deleteMany: {},
        create: [...coAuthorIds].map((userId) => ({ userId })),
      },
    },
  });

  await prisma.articleLock.deleteMany({
    where: {
      articleId: id,
      lockedByUserId: result.user.id,
      clientId: lockParsed.data.clientId,
    },
  });

  return NextResponse.json({ success: true, articleId: id });
}