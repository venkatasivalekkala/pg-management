"use client";

import { useState, useCallback } from "react";

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi(options?: UseApiOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (url: string, init?: RequestInit) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json", ...init?.headers },
          ...init,
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = data.error || `Request failed (${res.status})`;
          setError(msg);
          options?.onError?.(msg);
          return null;
        }
        options?.onSuccess?.(data);
        return data;
      } catch (e) {
        const msg = "Network error. Please try again.";
        setError(msg);
        options?.onError?.(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const get = useCallback((url: string) => request(url), [request]);
  const post = useCallback(
    (url: string, body: any) => request(url, { method: "POST", body: JSON.stringify(body) }),
    [request]
  );
  const put = useCallback(
    (url: string, body: any) => request(url, { method: "PUT", body: JSON.stringify(body) }),
    [request]
  );
  const del = useCallback(
    (url: string) => request(url, { method: "DELETE" }),
    [request]
  );

  return { loading, error, get, post, put, del, setError };
}
