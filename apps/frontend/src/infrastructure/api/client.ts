const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
