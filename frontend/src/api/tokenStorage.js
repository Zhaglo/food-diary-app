export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function setTokens({ access, refresh }) {
  if (access) {
    localStorage.setItem("accessToken", access);
  }

  if (refresh) {
    localStorage.setItem("refreshToken", refresh);
  }
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}