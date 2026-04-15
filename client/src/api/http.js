import { getToken } from "../utils/auth-storage";
import { getDonorToken } from "../utils/donor-auth-storage";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiRequest(path, options = {}) {
  const { authMode = "admin", ...fetchOptions } = options;
  const token =
    authMode === "donor" ? getDonorToken() : authMode === "none" ? null : getToken();
  const headers = new Headers(fetchOptions.headers || {});

  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Request failed.");
  }

  return result;
}
