import api from "./http";

export async function getDailyAnalytics(date) {
  const response = await api.get("/analytics/daily/", {
    params: { date },
  });

  return response.data;
}