import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/api";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validation";

export async function GET() {
  const result = await requireApiUser();

  if ("error" in result) {
    return result.error;
  }

  const articles = await prisma.article.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const result = await requireApiUser();

  if ("error" in result) {
    return result.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = articleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid article payload." }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      authorId: result.user.id,
      coAuthors: {
        create: parsed.data.coAuthorIds.map((userId) => ({ userId })),
      },
    },
  });

  return NextResponse.json({ success: true, articleId: article.id });
}