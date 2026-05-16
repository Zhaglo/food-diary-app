import { useEffect, useState } from "react";

import { getMyGoal, updateMyGoal } from "../api/goals";
import { useAuth } from "../context/AuthContext";

const initialGoalState = {
  calories: "",
  proteins: "",
  fats: "",
  carbs: "",
};

function getFirstApiError(error) {
  const responseData = error.response?.data;

  if (!responseData) {
    return "Произошла ошибка. Попробуй еще раз.";
  }

  if (typeof responseData.detail === "string") {
    return responseData.detail;
  }

  const firstValue = Object.values(responseData)[0];

  if (Array.isArray(firstValue)) {
    return firstValue[0];
  }

  return "Не удалось сохранить изменения.";
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [goalFormData, setGoalFormData] = useState(initialGoalState);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadGoal() {
      setIsLoading(true);
      setPageError("");

      try {
        const goal = await getMyGoal();

        setGoalFormData({
          calories: goal.calories,
          proteins: goal.proteins,
          fats: goal.fats,
          carbs: goal.carbs,
        });
      } catch {
        setPageError("Не удалось загрузить цели пользователя.");
      } finally {
        setIsLoading(false);
      }
    }

    loadGoal();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setGoalFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const updatedGoal = await updateMyGoal(goalFormData);

      setGoalFormData({
        calories: updatedGoal.calories,
        proteins: updatedGoal.proteins,
        fats: updatedGoal.fats,
        carbs: updatedGoal.carbs,
      });

      setSuccessMessage("Цели успешно обновлены.");
    } catch (error) {
      setFormError(getFirstApiError(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="page-state">Загружаем профиль...</div>;
  }

  if (pageError) {
    return <div className="page-error">{pageError}</div>;
  }

  return (
    <section className="profile-page">
      <div className="page-heading">
        <div>
          <h1>Профиль</h1>
          <p>Управление аккаунтом и дневными целями КБЖУ.</p>
        </div>
      </div>

      <div className="profile-layout">
        <article className="panel-card profile-user-card">
          <h2>Пользователь</h2>

          <div className="profile-user-row">
            <span>Логин</span>
            <strong>{user?.username}</strong>
          </div>

          <div className="profile-user-row">
            <span>Email</span>
            <strong>{user?.email || "Не указан"}</strong>
          </div>

          <div className="profile-user-row">
            <span>Роль</span>
            <strong>{user?.is_staff ? "Администратор" : "Пользователь"}</strong>
          </div>
        </article>

        <article className="panel-card">
          <h2>Дневные цели</h2>

          <form className="goal-form" onSubmit={handleSubmit}>
            <div className="form-grid-two">
              <label>
                Калории, ккал
                <input
                  type="number"
                  name="calories"
                  value={goalFormData.calories}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Белки, г
                <input
                  type="number"
                  name="proteins"
                  value={goalFormData.proteins}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Жиры, г
                <input
                  type="number"
                  name="fats"
                  value={goalFormData.fats}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Углеводы, г
                <input
                  type="number"
                  name="carbs"
                  value={goalFormData.carbs}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>
            </div>

            {formError && <div className="form-error">{formError}</div>}
            {successMessage && (
              <div className="form-success">{successMessage}</div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={isSaving}
            >
              {isSaving ? "Сохраняем..." : "Сохранить цели"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}