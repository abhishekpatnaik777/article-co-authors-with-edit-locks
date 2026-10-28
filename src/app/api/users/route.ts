import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await requireApiUser();

  if ("error" in result) {
    return result.error;
  }

  const users = await prisma.user.findMany({
    where: { id: { not: result.user.id } },
    select: { id: true, name: true, username: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ users });
}