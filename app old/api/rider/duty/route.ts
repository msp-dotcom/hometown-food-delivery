import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/rider/duty  { riderId, available }
export async function PATCH(req: NextRequest) {
  const { riderId, available } = await req.json();
  const rider = await prisma.rider.update({
    where: { id: riderId },
    data: { available },
  });
  return NextResponse.json(rider);
}
