import api from "./http";

export async function getMyGoal() {
  const response = await api.get("/goals/me/");
  return response.data;
}