import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/manage-riders — list every rider account
export async function GET() {
  const riders = await prisma.rider.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(riders);
}

// POST /api/admin/manage-riders  { name, phone } — Admin adds a new rider
// This is the only way a rider account gets created — riders never self-register.
// Prevents duplicate accounts for the same person by matching on the last 10 digits.
export async function POST(req: NextRequest) {
  const { name, phone } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
  }

  const last10 = phone.replace(/\D/g, "").slice(-10);
  const existingRiders = await prisma.rider.findMany();
  const existing = existingRiders.find((r) => r.phone.replace(/\D/g, "").slice(-10) === last10);
  if (existing) {
    return NextResponse.json(
      { error: `A rider with this number already exists: ${existing.name}` },
      { status: 409 }
    );
  }

  const rider = await prisma.rider.create({
    data: { name, phone, available: false },
  });
  return NextResponse.json(rider, { status: 201 });
}
