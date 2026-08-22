// Uploads directly to Supabase Storage's REST API using fetch — avoids adding
// the full @supabase/supabase-js package just for one upload call.
// Needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars,
// and a PUBLIC bucket named "menu-images" created once in the Supabase dashboard.

export async function uploadMenuImage(file: File): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Image upload isn't set up yet — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/menu-images/${fileName}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${text}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/menu-images/${fileName}`;
}
