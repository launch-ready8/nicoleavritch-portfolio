/**
 * Adds CORS origins to the Sanity project so the embedded Studio works
 * from localhost and the deployed URL. Best-effort — logs and continues on failure.
 * Env: SANITY_TOKEN, DEPLOY_URL (optional).
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "2h8pgj67";
const token = process.env.SANITY_TOKEN;

const origins = ["http://localhost:3000"];
if (process.env.DEPLOY_URL) {
  const u = process.env.DEPLOY_URL.startsWith("http") ? process.env.DEPLOY_URL : `https://${process.env.DEPLOY_URL}`;
  origins.push(new URL(u).origin);
}

for (const origin of origins) {
  try {
    const res = await fetch(`https://api.sanity.io/v2021-06-07/projects/${projectId}/cors`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ origin, allowCredentials: true }),
    });
    const body = await res.text();
    console.log(`[cors] ${origin} -> ${res.status} ${body.slice(0, 120)}`);
  } catch (e) {
    console.warn(`[cors] ${origin} failed: ${e.message}`);
  }
}
