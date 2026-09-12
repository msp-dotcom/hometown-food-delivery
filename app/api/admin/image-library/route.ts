import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/admin/image-library — lists every image already uploaded to the
// "menu-images" bucket, so Admin can pick an existing photo instead of
// uploading a new one every time.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Image storage isn't configured yet" }, { status: 500 });
  }

  const res = await fetch(`${supabaseUrl}/storage/v1/object/list/menu-images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: "", limit: 200, sortBy: { column: "name", order: "asc" } }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Could not list images" }, { status: 500 });
  }

  const files: any[] = await res.json();
  const images = files
    .filter((f) => f.name && !f.name.startsWith(".")) // skip hidden/placeholder entries
    .map((f) => ({
      name: f.name,
      // A readable label derived from the filename, e.g. "chicken-biryani.jpg" -> "Chicken Biryani"
      label: f.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/^\d+\s*/, "") // strip a leading timestamp if present
        .replace(/\b\w/g, (c: string) => c.toUpperCase()),
      url: `${supabaseUrl}/storage/v1/object/public/menu-images/${f.name}`,
    }));

  return NextResponse.json(images);
}
