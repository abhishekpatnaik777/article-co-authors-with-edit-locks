import { NextResponse } from "next/server";

import { isLockStale } from "@/lib/articles";
import { requireApiUser } from "@/lib/auth/api";
import { prisma } from "@/lib/prisma";
import { lockSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: RouteContext<"/api/articles/[id]/heartbeat">) {
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

  const lock = await prisma.articleLock.findUnique({
    where: { articleId: id },
  });

  if (!lock || lock.lockedByUserId !== result.user.id || lock.clientId !== parsed.data.clientId) {
    return NextResponse.json({ error: "You lost the edit lock. Please refresh to continue." }, { status: 409 });
  }

  if (isLockStale(lock.lastSeenAt)) {
    await prisma.articleLock.deleteMany({
      where: {
        articleId: id,
        clientId: parsed.data.clientId,
      },
    });
    return NextResponse.json({ error: "You lost the edit lock. Please refresh to continue." }, { status: 409 });
  }

  await prisma.articleLock.update({
    where: { articleId: id },
    data: { lastSeenAt: new Date() },
  });

  return NextResponse.json({ success: true });
}