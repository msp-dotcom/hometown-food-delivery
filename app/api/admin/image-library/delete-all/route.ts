import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/admin/image-library/delete-all — wipes every image in the bucket
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Image storage isn't configured yet" }, { status: 500 });
  }

  // First, list everything currently in the bucket
  const listRes = await fetch(`${supabaseUrl}/storage/v1/object/list/menu-images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: "", limit: 1000 }),
  });

  if (!listRes.ok) {
    return NextResponse.json({ error: "Could not list images" }, { status: 500 });
  }

  const files: any[] = await listRes.json();
  const names = files.filter((f) => f.name).map((f) => f.name);

  if (names.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0 });
  }

  // Delete them all in one request
  const deleteRes = await fetch(`${supabaseUrl}/storage/v1/object/menu-images`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: names }),
  });

  if (!deleteRes.ok) {
    return NextResponse.json({ error: "Could not delete images" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: names.length });
}
