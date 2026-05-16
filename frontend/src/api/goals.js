import api from "./http";

export async function getMyGoal() {
  const response = await api.get("/goals/me/");
  return response.data;
}

export async function updateMyGoal(payload) {
  const response = await api.patch("/goals/me/", payload);
  return response.data;
}