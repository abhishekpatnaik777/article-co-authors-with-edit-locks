import { NextResponse } from "next/server";

import { canEditArticle, isLockStale } from "@/lib/articles";
import { requireApiUser } from "@/lib/auth/api";
import { prisma } from "@/lib/prisma";
import { lockSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: RouteContext<"/api/articles/[id]/lock">) {
  const result = await requireApiUser();

  if ("error" in result) {
    return result.error;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = lockSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "clientId is required." }, { status: 400 });
  }

  const permission = await canEditArticle(id, result.user.id);

  if (!permission.article) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  if (!permission.canEdit) {
    return NextResponse.json({ error: "You are not allowed to edit this article." }, { status: 403 });
  }

  const existingLock = await prisma.articleLock.findUnique({
    where: { articleId: id },
    include: { lockedByUser: true },
  });

  const canTakeLock =
    !existingLock ||
    isLockStale(existingLock.lastSeenAt) ||
    (existingLock.lockedByUserId === result.user.id && existingLock.clientId === parsed.data.clientId);

  if (canTakeLock) {
    await prisma.articleLock.upsert({
      where: { articleId: id },
      update: {
        lockedByUserId: result.user.id,
        clientId: parsed.data.clientId,
        lastSeenAt: new Date(),
      },
      create: {
        articleId: id,
        lockedByUserId: result.user.id,
        clientId: parsed.data.clientId,
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: `This article is currently being edited by ${existingLock.lockedByUser.name}.` },
    { status: 423 },
  );
}

export async function DELETE(request: Request, { params }: RouteContext<"/api/articles/[id]/lock">) {
  const result = await requireApiUser();

  if ("error" in result) {
    return result.error;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = lockSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "clientId is required." }, { status: 400 });
  }

  await prisma.articleLock.deleteMany({
    where: {
      articleId: id,
      lockedByUserId: result.user.id,
      clientId: parsed.data.clientId,
    },
  });

  return NextResponse.json({ success: true });
}