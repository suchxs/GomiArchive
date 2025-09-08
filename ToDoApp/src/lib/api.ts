const ROOT_URL = "/api" as const;

function buildUrl(path: string, params?: Record<string, string | number>) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const full = `${origin}${ROOT_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const url = new URL(full);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function parseResponse<T>(res: Response): Promise<T> {
  // Try strict JSON first
  try {
    return (await res.clone().json()) as T;
  } catch {}

  // Fallback: read text and try to extract embedded JSON
  const text = await res.text();
  try {
    // If text itself is JSON
    return JSON.parse(text) as T;
  } catch {}

  try {
    // Find last JSON object in the string (handles HTML + JSON mixed)
    const matches = text.match(/\{[\s\S]*\}/g);
    if (matches && matches.length) {
      const last = matches[matches.length - 1];
      return JSON.parse(last) as T;
    }
  } catch {}

  return { status: res.status, message: text || res.statusText } as unknown as T;
}

export async function apiGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url.toString(), { method: "GET" });
  return parseResponse<T>(res);
}

export async function apiSendJson<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: Record<string, unknown>): Promise<T> {
  const url = buildUrl(path);
  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json, text/plain, */*" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(res);
}

export async function apiSendFormUrlencoded<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: Record<string, unknown>): Promise<T> {
  const url = buildUrl(path);
  const encoded = body
    ? new URLSearchParams(
        Object.entries(body).reduce<Record<string, string>>((acc, [k, v]) => {
          acc[k] = v == null ? "" : String(v);
          return acc;
        }, {})
      )
    : undefined;
  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", Accept: "application/json, text/plain, */*" },
    body: encoded?.toString(),
  });
  return parseResponse<T>(res);
}

export async function apiSendFormUrlencodedNoHeader<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: Record<string, unknown>): Promise<T> {
  const url = buildUrl(path);
  const encoded = body
    ? new URLSearchParams(
        Object.entries(body).reduce<Record<string, string>>((acc, [k, v]) => {
          acc[k] = v == null ? "" : String(v);
          return acc;
        }, {})
      )
    : undefined;
  const res = await fetch(url.toString(), {
    method,
    body: encoded?.toString(),
  });
  return parseResponse<T>(res);
}
export async function apiSendMultipart<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: Record<string, unknown>): Promise<T> {
  const url = buildUrl(path);
  const form = new FormData();
  if (body) {
    for (const [k, v] of Object.entries(body)) {
      form.append(k, v == null ? "" : String(v));
    }
  }
  const res = await fetch(url.toString(), {
    method,
    body: form,
  });
  return parseResponse<T>(res);
}


