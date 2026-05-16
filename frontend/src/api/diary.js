import api from "./http";

export async function getMealEntries(date) {
  const response = await api.get("/diary/entries/", {
    params: { date },
  });

  return response.data;
}

export async function createMealEntry(payload) {
  const response = await api.post("/diary/entries/", payload);
  return response.data;
}

export async function deleteMealEntry(entryId) {
  await api.delete(`/diary/entries/${entryId}/`);
}