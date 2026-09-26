async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function analyzeResume(file, persona) {
  const form = new FormData();
  form.append("resume", file);
  form.append("persona", persona);
  const res = await fetch("/api/resume", { method: "POST", body: form });
  return handle(res);
}

export async function generateBlueprints(profile, direction) {
  const res = await fetch("/api/careers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, direction }),
  });
  return handle(res);
}

export async function generateRoadmap(profile, blueprint) {
  const res = await fetch("/api/roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, blueprint }),
  });
  return handle(res);
}
