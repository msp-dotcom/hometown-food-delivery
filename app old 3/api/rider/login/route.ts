import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/rider/login  { phone }
// NOTE: Real OTP verification (via MSG91 or similar) should wrap this later —
// for now this just checks the phone is a rider Admin has already registered,
// matching the "only approved numbers can log in" rule from our design.
export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone is required" }, { status: 400 });

  const rider = await prisma.rider.findUnique({ where: { phone } });
  if (!rider) {
    return NextResponse.json(
      { error: "This number isn't registered. Ask Admin to add you as a rider first." },
      { status: 404 }
    );
  }
  return NextResponse.json(rider);
}
