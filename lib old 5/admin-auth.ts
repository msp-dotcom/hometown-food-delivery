// Uses the standard Web Crypto API (crypto.subtle) instead of Node's "crypto"
// module, because this needs to run inside Next.js middleware, which executes
// on the Edge runtime — Web Crypto works in both places, Node's does not.

export async function hashAdminSecret(secret: string): Promise<string> {
  const data = new TextEncoder().encode("hometown-ops-salt-" + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getExpectedAdminToken(): Promise<string> {
  return hashAdminSecret(process.env.ADMIN_PASSWORD || "");
}
