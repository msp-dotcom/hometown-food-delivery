import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/manage-riders — list every rider account
export async function GET() {
  const riders = await prisma.rider.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(riders);
}

// POST /api/admin/manage-riders  { name, phone } — Admin adds a new rider
// This is the only way a rider account gets created — riders never self-register.
export async function POST(req: NextRequest) {
  const { name, phone } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
  }
  const rider = await prisma.rider.create({
    data: { name, phone, available: false },
  });
  return NextResponse.json(rider, { status: 201 });
}
