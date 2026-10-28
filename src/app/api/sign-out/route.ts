import { NextResponse } from "next/server";

import { getSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();

  if (session) {
    await prisma.articleLock.deleteMany({
      where: { lockedByUserId: session.userId },
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  return response;
}
