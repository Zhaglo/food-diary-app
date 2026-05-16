import { useEffect, useMemo, useState } from "react";

import { getProducts } from "../api/products";
import {
  createMealEntry,
  deleteMealEntry,
  getMealEntries,
} from "../api/diary";

const mealTypeOptions = [
  { value: "breakfast", label: "Завтрак" },
  { value: "lunch", label: "Обед" },
  { value: "dinner", label: "Ужин" },
  { value: "snack", label: "Перекус" },
];

function getTodayDate() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function formatValue(value) {
  return Number(value || 0).toFixed(1);
}

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

  return "Не удалось выполнить действие.";
}

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const [products, setProducts] = useState([]);
  const [entries, setEntries] = useState([]);

  const [formData, setFormData] = useState({
    product: "",
    meal_type: "breakfast",
    weight_grams: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState(null);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadDiaryData() {
      setIsLoading(true);
      setPageError("");

      try {
        const [productsData, entriesData] = await Promise.all([
          getProducts(),
          getMealEntries(selectedDate),
        ]);

        setProducts(productsData);
        setEntries(entriesData);
      } catch {
        setPageError("Не удалось загрузить дневник питания.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDiaryData();
  }, [selectedDate]);

  const totals = useMemo(() => {
    return entries.reduce(
      (accumulator, entry) => ({
        calories: accumulator.calories + Number(entry.calories || 0),
        proteins: accumulator.proteins + Number(entry.proteins || 0),
        fats: accumulator.fats + Number(entry.fats || 0),
        carbs: accumulator.carbs + Number(entry.carbs || 0),
      }),
      {
        calories: 0,
        proteins: 0,
        fats: 0,
        carbs: 0,
      }
    );
  }, [entries]);

  const productsById = useMemo(() => {
    return Object.fromEntries(
      products.map((product) => [product.id, product])
    );
  }, [products]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setIsSubmitting(true);

    try {
      const createdEntry = await createMealEntry({
        ...formData,
        date: selectedDate,
      });

      setEntries((prevEntries) => [createdEntry, ...prevEntries]);

      setFormData({
        product: "",
        meal_type: "breakfast",
        weight_grams: "",
      });
    } catch (error) {
      setFormError(getFirstApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entryId) {
    setDeletingEntryId(entryId);
    setPageError("");

    try {
      await deleteMealEntry(entryId);

      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== entryId)
      );
    } catch (error) {
      setPageError(getFirstApiError(error));
    } finally {
      setDeletingEntryId(null);
    }
  }

  function getMealTypeLabel(mealType) {
    const option = mealTypeOptions.find((item) => item.value === mealType);
    return option?.label || mealType;
  }

  return (
    <section className="diary-page">
      <div className="page-heading">
        <div>
          <h1>Дневник питания</h1>
          <p>Добавляй приемы пищи и отслеживай КБЖУ за день.</p>
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

      <div className="diary-summary-grid">
        <article className="summary-card">
          <span>Калории</span>
          <strong>{formatValue(totals.calories)} ккал</strong>
        </article>

        <article className="summary-card">
          <span>Белки</span>
          <strong>{formatValue(totals.proteins)} г</strong>
        </article>

        <article className="summary-card">
          <span>Жиры</span>
          <strong>{formatValue(totals.fats)} г</strong>
        </article>

        <article className="summary-card">
          <span>Углеводы</span>
          <strong>{formatValue(totals.carbs)} г</strong>
        </article>
      </div>

      <div className="diary-layout">
        <article className="panel-card">
          <h2>Добавить прием пищи</h2>

          <form className="diary-form" onSubmit={handleSubmit}>
            <label>
              Продукт
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                required
              >
                <option value="">Выбери продукт</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Прием пищи
              <select
                name="meal_type"
                value={formData.meal_type}
                onChange={handleChange}
                required
              >
                {mealTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Вес, г
              <input
                type="number"
                name="weight_grams"
                value={formData.weight_grams}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="Например, 150"
                required
              />
            </label>

            {formError && <div className="form-error">{formError}</div>}

            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting || products.length === 0}
            >
              {isSubmitting ? "Добавляем..." : "Добавить запись"}
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="entries-header">
            <div>
              <h2>Записи за день</h2>
              <p>Дата: {selectedDate}</p>
            </div>
          </div>

          {pageError && <div className="page-error">{pageError}</div>}

          {isLoading ? (
            <div className="inline-state">Загружаем записи...</div>
          ) : entries.length === 0 ? (
            <div className="inline-state">
              За эту дату приемы пищи пока не добавлены.
            </div>
          ) : (
            <div className="entries-list">
              {entries.map((entry) => {
                const product = productsById[entry.product];

                return (
                  <article key={entry.id} className="entry-item">
                    <div className="entry-main">
                      <div className="entry-title-row">
                        <h3>{product?.name || "Продукт"}</h3>
                        <span>{getMealTypeLabel(entry.meal_type)}</span>
                      </div>

                      <p className="entry-meta">
                        Вес: {entry.weight_grams} г
                      </p>

                      <div className="entry-macros">
                        <span>{formatValue(entry.calories)} ккал</span>
                        <span>Б: {formatValue(entry.proteins)}</span>
                        <span>Ж: {formatValue(entry.fats)}</span>
                        <span>У: {formatValue(entry.carbs)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingEntryId === entry.id}
                    >
                      {deletingEntryId === entry.id
                        ? "Удаляем..."
                        : "Удалить"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}