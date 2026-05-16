import { useEffect, useMemo, useState } from "react";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../api/products";
import { useAuth } from "../context/AuthContext";

const initialFormState = {
  name: "",
  calories_per_100g: "",
  proteins_per_100g: "",
  fats_per_100g: "",
  carbs_per_100g: "",
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

  return "Не удалось выполнить действие.";
}

export default function ProductsPage() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState(initialFormState);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingFormData, setEditingFormData] = useState(initialFormState);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingError, setEditingError] = useState("");

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setPageError("");

      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        setPageError("Не удалось загрузить список продуктов.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedQuery)
    );
  }, [products, searchQuery]);

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
      const createdProduct = await createProduct(formData);

      setProducts((prevProducts) => [
        createdProduct,
        ...prevProducts,
      ]);

      setFormData(initialFormState);
    } catch (error) {
      setFormError(getFirstApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(productId) {
    setDeletingProductId(productId);
    setPageError("");

    try {
      await deleteProduct(productId);

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
    } catch (error) {
      setPageError(getFirstApiError(error));
    } finally {
      setDeletingProductId(null);
    }
  }

  function canManageProduct(product) {
    return user?.is_staff || product.created_by === user?.id;
  }

  function startEditing(product) {
    setEditingProductId(product.id);
    setEditingError("");

    setEditingFormData({
      name: product.name,
      calories_per_100g: product.calories_per_100g,
      proteins_per_100g: product.proteins_per_100g,
      fats_per_100g: product.fats_per_100g,
      carbs_per_100g: product.carbs_per_100g,
    });
  }

  function cancelEditing() {
    setEditingProductId(null);
    setEditingFormData(initialFormState);
    setEditingError("");
  }

  function handleEditingChange(event) {
    const { name, value } = event.target;

    setEditingFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  async function handleUpdate(event) {
    event.preventDefault();

    setEditingError("");
    setIsUpdating(true);

    try {
      const updatedProduct = await updateProduct(
        editingProductId,
        editingFormData
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );

      cancelEditing();
    } catch (error) {
      setEditingError(getFirstApiError(error));
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <section className="products-page">
      <div className="page-heading">
        <div>
          <h1>Продукты</h1>
          <p>Каталог продуктов с КБЖУ на 100 граммов.</p>
        </div>
      </div>

      <div className="products-layout">
        <article className="panel-card">
          <h2>Добавить продукт</h2>

          <form className="product-form" onSubmit={handleSubmit}>
            <label>
              Название
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Например, гречка"
                required
              />
            </label>

            <div className="form-grid-two">
              <label>
                Калории
                <input
                  type="number"
                  name="calories_per_100g"
                  value={formData.calories_per_100g}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Белки
                <input
                  type="number"
                  name="proteins_per_100g"
                  value={formData.proteins_per_100g}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Жиры
                <input
                  type="number"
                  name="fats_per_100g"
                  value={formData.fats_per_100g}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Углеводы
                <input
                  type="number"
                  name="carbs_per_100g"
                  value={formData.carbs_per_100g}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Сохраняем..." : "Добавить продукт"}
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="products-list-header">
            <div>
              <h2>Каталог</h2>
              <p>Всего продуктов: {products.length}</p>
            </div>

            <input
              className="search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск..."
            />
          </div>

          {pageError && <div className="page-error">{pageError}</div>}

          {isLoading ? (
            <div className="inline-state">Загружаем продукты...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="inline-state">Продукты не найдены.</div>
          ) : (
            <div className="product-list">
              {filteredProducts.map((product) => (
                <article key={product.id} className="product-item">
                  {editingProductId === product.id ? (
                    <form className="edit-product-form" onSubmit={handleUpdate}>
                      <label>
                        Название
                        <input
                          type="text"
                          name="name"
                          value={editingFormData.name}
                          onChange={handleEditingChange}
                          required
                        />
                      </label>

                      <div className="form-grid-two">
                        <label>
                          Калории
                          <input
                            type="number"
                            name="calories_per_100g"
                            value={editingFormData.calories_per_100g}
                            onChange={handleEditingChange}
                            min="0"
                            step="0.01"
                            required
                          />
                        </label>

                        <label>
                          Белки
                          <input
                            type="number"
                            name="proteins_per_100g"
                            value={editingFormData.proteins_per_100g}
                            onChange={handleEditingChange}
                            min="0"
                            step="0.01"
                            required
                          />
                        </label>

                        <label>
                          Жиры
                          <input
                            type="number"
                            name="fats_per_100g"
                            value={editingFormData.fats_per_100g}
                            onChange={handleEditingChange}
                            min="0"
                            step="0.01"
                            required
                          />
                        </label>

                        <label>
                          Углеводы
                          <input
                            type="number"
                            name="carbs_per_100g"
                            value={editingFormData.carbs_per_100g}
                            onChange={handleEditingChange}
                            min="0"
                            step="0.01"
                            required
                          />
                        </label>
                      </div>

                      {editingError && <div className="form-error">{editingError}</div>}

                      <div className="product-actions">
                        <button
                          type="submit"
                          className="primary-button"
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Сохраняем..." : "Сохранить"}
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="product-item-main">
                        <h3>{product.name}</h3>

                        <div className="product-macros">
                          <span>{product.calories_per_100g} ккал</span>
                          <span>Б: {product.proteins_per_100g}</span>
                          <span>Ж: {product.fats_per_100g}</span>
                          <span>У: {product.carbs_per_100g}</span>
                        </div>
                      </div>

                      {canManageProduct(product) && (
                        <div className="product-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => startEditing(product)}
                          >
                            Редактировать
                          </button>

                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingProductId === product.id}
                          >
                            {deletingProductId === product.id
                              ? "Удаляем..."
                              : "Удалить"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}