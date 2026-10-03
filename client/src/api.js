// Empty by default, same origin, exactly what the app has always done
// (the Vite dev proxy or Express serving both in one process). Only the
// GitHub Pages build sets this, to point at the separately hosted backend.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function analyzeResume(file) {
  const form = new FormData();
  form.append("resume", file);
  const res = await fetch(`${API_BASE}/api/resume`, { method: "POST", body: form });
  return handle(res);
}

export async function generateBlueprints(profile, direction) {
  const res = await fetch(`${API_BASE}/api/careers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, direction }),
  });
  return handle(res);
}

export async function generateRoadmap(profile, blueprint) {
  const res = await fetch(`${API_BASE}/api/roadmap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, blueprint }),
  });
  return handle(res);
}
