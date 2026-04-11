const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface GqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function gqlRequest<TData, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
): Promise<TData> {
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(await res.text());

  const json: GqlResponse<TData> = await res.json();

  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error("No data returned");

  return json.data;
}
export async function gqlUpload<TData>(
  query: string,
  variables: Record<string, unknown>,
  files: { field: string; file: File }[],
): Promise<TData> {
  const map: Record<string, string[]> = {};
  const form = new FormData();

  form.append("operations", JSON.stringify({ query, variables }));
  files.forEach((_, i) => {
    map[String(i)] = [`variables.files.${i}`]; // ← corrigé
  });
  form.append("map", JSON.stringify(map));
  files.forEach(({ file }, i) => {
    form.append(String(i), file);
  });

  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    credentials: "include",
    headers: { "apollo-require-preflight": "true" },
    body: form,
  });

  if (!res.ok) throw new Error(await res.text());

  const json: GqlResponse<TData> = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error("No data returned");

  return json.data;
}
