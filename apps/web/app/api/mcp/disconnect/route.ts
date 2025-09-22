import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { withAuth } from "@/utils/middleware";

export const DELETE = withAuth(async (req) => {
  const userId = req.auth.userId;
  const { integrationName } = await req.json().catch(() => ({} as any));
  if (!integrationName) return NextResponse.json({ error: "integrationName required" }, { status: 400 });

  const integration = await prisma.mcpIntegration.findUnique({ where: { name: integrationName } });
  if (!integration) return NextResponse.json({ error: "Unknown integration" }, { status: 404 });

  const existing = await prisma.mcpConnection.findFirst({ where: { userId, integrationId: integration.id } });
  if (!existing) return NextResponse.json({ ok: true });

  await prisma.$transaction([
    prisma.mcpTool.deleteMany({ where: { connectionId: existing.id } }),
    prisma.mcpConnection.delete({ where: { id: existing.id } }),
  ]);

  return NextResponse.json({ ok: true });
});

