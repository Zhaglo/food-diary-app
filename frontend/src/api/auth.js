import api from "./http";
import { setTokens } from "./tokenStorage";

export async function registerUser(payload) {
  const response = await api.post("/auth/register/", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("/token/", payload);

  setTokens({
    access: response.data.access,
    refresh: response.data.refresh,
  });

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me/");
  return response.data;
}