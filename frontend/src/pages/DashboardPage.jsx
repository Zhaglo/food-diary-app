import { useEffect, useMemo, useState } from "react";

import { getDailyAnalytics } from "../api/analytics";
import { getMyGoal } from "../api/goals";

function getTodayDate() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function formatValue(value) {
  return Number(value || 0).toFixed(1);
}

function calculateProgress(current, goal) {
  const currentNumber = Number(current || 0);
  const goalNumber = Number(goal || 0);

  if (goalNumber <= 0) {
    return 0;
  }

  return Math.min((currentNumber / goalNumber) * 100, 100);
}

const nutrientConfig = [
  {
    key: "calories",
    label: "Калории",
    unit: "ккал",
  },
  {
    key: "proteins",
    label: "Белки",
    unit: "г",
  },
  {
    key: "fats",
    label: "Жиры",
    unit: "г",
  },
  {
    key: "carbs",
    label: "Углеводы",
    unit: "г",
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [dailyAnalytics, setDailyAnalytics] = useState(null);
  const [goal, setGoal] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setError("");

      try {
        const [analyticsData, goalData] = await Promise.all([
          getDailyAnalytics(selectedDate),
          getMyGoal(),
        ]);

        setDailyAnalytics(analyticsData);
        setGoal(goalData);
      } catch {
        setError("Не удалось загрузить данные dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [selectedDate]);

  const summaryCards = useMemo(() => {
    if (!dailyAnalytics || !goal) {
      return [];
    }

    return nutrientConfig.map((nutrient) => {
      const current = dailyAnalytics.totals[nutrient.key];
      const target = goal[nutrient.key];
      const progress = calculateProgress(current, target);

      return {
        ...nutrient,
        current,
        target,
        progress,
      };
    });
  }, [dailyAnalytics, goal]);

  if (isLoading) {
    return <div className="page-state">Загружаем dashboard...</div>;
  }

  if (error) {
    return <div className="page-error">{error}</div>;
  }

  return (
    <section className="dashboard-page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Краткая сводка по питанию и целям на день.</p>
        </div>

        <label className="date-control">
          Дата
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>
      </div>

      <div className="nutrient-grid">
        {summaryCards.map((card) => (
          <article key={card.key} className="nutrient-card">
            <div className="nutrient-card-header">
              <h2>{card.label}</h2>
              <span>{card.unit}</span>
            </div>

            <div className="nutrient-main-value">
              {formatValue(card.current)}
              <small>
                {" "}
                / {formatValue(card.target)} {card.unit}
              </small>
            </div>

            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${card.progress}%` }}
              />
            </div>

            <p className="progress-label">
              Выполнено: {formatValue(card.progress)}%
            </p>
          </article>
        ))}
      </div>

      <article className="dashboard-note">
        <h2>Итог дня</h2>
        <p>
          Данные рассчитаны по всем добавленным приемам пищи за{" "}
          <strong>{selectedDate}</strong>.
        </p>
      </article>
    </section>
  );
}