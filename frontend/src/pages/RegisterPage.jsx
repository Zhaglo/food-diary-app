import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { registerUser } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      const apiError = err.response?.data;

      if (apiError) {
        const firstError = Object.values(apiError).flat()[0];
        setError(firstError || "Не удалось зарегистрироваться.");
      } else {
        setError("Ошибка сети. Попробуй еще раз.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Создать аккаунт</h1>
        <p>Зарегистрируйся, чтобы вести дневник питания.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Логин
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Повтори пароль
            <input
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              required
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}