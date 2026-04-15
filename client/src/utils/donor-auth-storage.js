const TOKEN_KEY = "storytelling_donor_token";
const USER_KEY = "storytelling_donor_user";

export function getDonorToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setDonorSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getDonorSessionUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearDonorSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
