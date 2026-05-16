import { useEffect, useMemo, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { getWeeklyAnalytics } from "../api/analytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function getTodayDate() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function formatValue(value) {
  return Number(value || 0).toFixed(1);
}

function formatDateLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function calculateAverage(days, key) {
  if (!days.length) {
    return 0;
  }

  const total = days.reduce(
    (sum, day) => sum + Number(day[key] || 0),
    0
  );

  return total / days.length;
}

export default function AnalyticsPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWeeklyAnalytics() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getWeeklyAnalytics(selectedDate);
        setWeeklyAnalytics(data);
      } catch {
        setError("Не удалось загрузить недельную аналитику.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWeeklyAnalytics();
  }, [selectedDate]);

  const days = weeklyAnalytics?.days || [];

  const chartData = useMemo(() => {
    return {
      labels: days.map((day) => formatDateLabel(day.date)),
      datasets: [
        {
          label: "Калории",
          data: days.map((day) => Number(day.calories || 0)),
          borderWidth: 3,
          tension: 0.35,
        },
      ],
    };
  }, [days]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "ккал",
        },
      },
    },
  };

  const averageStats = useMemo(() => {
    return {
      calories: calculateAverage(days, "calories"),
      proteins: calculateAverage(days, "proteins"),
      fats: calculateAverage(days, "fats"),
      carbs: calculateAverage(days, "carbs"),
    };
  }, [days]);

  const totalCalories = useMemo(() => {
    return days.reduce(
      (sum, day) => sum + Number(day.calories || 0),
      0
    );
  }, [days]);

  if (isLoading) {
    return <div className="page-state">Загружаем аналитику...</div>;
  }

  if (error) {
    return <div className="page-error">{error}</div>;
  }

  return (
    <section className="analytics-page">
      <div className="page-heading">
        <div>
          <h1>Аналитика</h1>
          <p>Динамика питания за последние 7 дней.</p>
        </div>

        <label className="date-control">
          Конечная дата периода
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>
      </div>

      <div className="analytics-summary-grid">
        <article className="summary-card">
          <span>Калории за неделю</span>
          <strong>{formatValue(totalCalories)} ккал</strong>
        </article>

        <article className="summary-card">
          <span>Средние калории</span>
          <strong>{formatValue(averageStats.calories)} ккал</strong>
        </article>

        <article className="summary-card">
          <span>Средние белки</span>
          <strong>{formatValue(averageStats.proteins)} г</strong>
        </article>

        <article className="summary-card">
          <span>Средние жиры / углеводы</span>
          <strong>
            {formatValue(averageStats.fats)} / {formatValue(averageStats.carbs)} г
          </strong>
        </article>
      </div>

      <article className="panel-card analytics-chart-card">
        <div className="analytics-chart-header">
          <div>
            <h2>Калории по дням</h2>
            <p>
              Период: {weeklyAnalytics.start_date} — {weeklyAnalytics.end_date}
            </p>
          </div>
        </div>

        <div className="analytics-chart-wrapper">
          <Line data={chartData} options={chartOptions} />
        </div>
      </article>

      <article className="panel-card analytics-table-card">
        <h2>Детализация по дням</h2>

        <div className="analytics-table">
          <div className="analytics-table-row analytics-table-head">
            <span>Дата</span>
            <span>Ккал</span>
            <span>Белки</span>
            <span>Жиры</span>
            <span>Углеводы</span>
          </div>

          {days.map((day) => (
            <div key={day.date} className="analytics-table-row">
              <span>{day.date}</span>
              <span>{formatValue(day.calories)}</span>
              <span>{formatValue(day.proteins)}</span>
              <span>{formatValue(day.fats)}</span>
              <span>{formatValue(day.carbs)}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}