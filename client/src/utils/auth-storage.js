const TOKEN_KEY = "storytelling_admin_token";
const USER_KEY = "storytelling_admin_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSessionUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function updateSessionUser(patch) {
  const currentUser = getSessionUser();

  if (!currentUser) {
    return;
  }

  localStorage.setItem(USER_KEY, JSON.stringify({ ...currentUser, ...patch }));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
