# Food Diary App

Веб-приложение **«Персональный дневник питания с анализом КБЖУ»** для ведения учета приемов пищи, автоматического расчета калорий, белков, жиров и углеводов, а также просмотра аналитики по дням и неделям.

Проект реализован как fullstack client-server приложение:

- **Frontend:** React + Vite
- **Backend:** Django + Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Documentation:** Swagger / OpenAPI
- **Containerization:** Docker + Docker Compose + Nginx
- **CI:** GitHub Actions

---

## Возможности приложения

### Пользователь
- регистрация и вход в систему;
- JWT-аутентификация;
- просмотр профиля;
- настройка дневных целей по КБЖУ;
- просмотр каталога продуктов;
- создание, редактирование и удаление собственных продуктов;
- добавление приемов пищи в дневник;
- автоматический расчет КБЖУ по граммовке;
- просмотр дневной сводки;
- просмотр недельной аналитики и графика.

### Роли
- **Обычный пользователь**
  - может управлять своими продуктами;
  - может вести собственный дневник питания;
  - не может изменять чужие продукты.
- **Администратор**
  - может управлять всеми продуктами;
  - имеет доступ к административной панели Django.

---

## Технологический стек

### Backend
- Python 3.12
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- drf-spectacular
- django-environ
- Gunicorn

### Frontend
- React
- Vite
- Axios
- React Router
- Chart.js
- react-chartjs-2

### Infrastructure
- Docker
- Docker Compose
- Nginx
- GitHub Actions

### Testing
- Django TestCase
- DRF APITestCase
- Hypothesis для фаззинг-тестирования

---

## Архитектура

Приложение построено по клиент-серверной архитектуре:

```text
React SPA
   ↓ HTTP / JSON
Django REST API
   ↓ ORM
PostgreSQL
```

В контейнерной конфигурации используется Nginx:

```
Nginx
├── /        → React frontend
├── /api/    → Django REST API
├── /admin/  → Django Admin
└── /static/ → Django static files
```

---

## Основной пользовательский сценарий

```
Регистрация
→ Вход
→ Работа с каталогом продуктов
→ Добавление приема пищи
→ Автоматический расчет КБЖУ
→ Просмотр dashboard
→ Анализ недельной статистики
```

---

## Структура проекта

```
food-diary-app/
├── backend/
│   ├── analytics/
│   ├── diary/
│   ├── food_diary/
│   ├── products/
│   ├── users/
│   ├── manage.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── routes/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.production
│
├── nginx/
│   └── default.conf
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

### Backend-приложения

#### users

- кастомная модель пользователя;
- регистрация;
- endpoint текущего пользователя;
- дневные цели КБЖУ.

#### products

- CRUD продуктов;
- валидация КБЖУ;
- объектные права доступа.

#### diary

- записи дневника питания;
- типы приемов пищи;
- расчет КБЖУ по весу продукта.

#### analytics

- дневная аналитика;
- недельная аналитика;
- агрегация КБЖУ.

---

## API-документация

После запуска проекта доступна Swagger-документация:

```
http://localhost/api/docs/
```

OpenAPI schema:

```
http://localhost/api/schema/
```

Django Admin:

```
http://localhost/admin/
```

---

## Основные API endpoints

### Авторизация

```
POST /api/auth/register/
POST /api/token/
POST /api/token/refresh/
GET  /api/auth/me/
```

### Цели пользователя

```
GET   /api/goals/me/
PATCH /api/goals/me/
```

### Продукты

```
GET    /api/products/
POST   /api/products/
GET    /api/products/{id}/
PATCH  /api/products/{id}/
DELETE /api/products/{id}/
```

### Дневник питания

```
GET    /api/diary/entries/
GET    /api/diary/entries/?date=YYYY-MM-DD
POST   /api/diary/entries/
PATCH  /api/diary/entries/{id}/
DELETE /api/diary/entries/{id}/
```

### Аналитика

```
GET /api/analytics/daily/?date=YYYY-MM-DD
GET /api/analytics/weekly/?date=YYYY-MM-DD
```

---

## Запуск проекта через Docker

### 1. Клонировать репозиторий

```bash
git clone <repository-url>
cd food-diary-app
```

### 2. Создать .env для backend

Создать файл:

```
backend/.env
```

Пример содержимого:

```
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=postgresql://food_diary_user:food_diary_password@127.0.0.1:5435/food_diary_db
```

При запуске backend внутри Docker значение **DATABASE_URL** переопределяется через **docker-compose.yml**.

### 3. Запустить контейнеры

```bash
docker compose up --build -d
```

### 4. Выполнить миграции

```bash
docker compose exec backend python manage.py migrate
```

### 5. Собрать backend static files

```bash
docker compose exec backend python manage.py collectstatic --noinput
```

### 6. Заполнить базу демонстрационными данными

```bash
docker compose exec backend python manage.py seed_demo_data
```

После этого приложение будет доступно:

```
http://localhost/
```

---

## Демонстрационные пользователи

После выполнения команды:

```bash
python manage.py seed_demo_data
```

создаются пользователи:

#### Администратор

```
username: admin_demo
password: AdminDemo123!
```

#### Обычный пользователь

```
username: demo_user
password: DemoUser123!
```

---

## Локальный запуск без полного Docker-стека

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py seed_demo_data
python3 manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен по адресу:

```
http://localhost:5173/
```

---

## Тестирование

### Запуск всех backend-тестов

```bash
cd backend
python3 manage.py test
```

### Что покрывается тестами

- права доступа к продуктам;
- запрет изменения чужих объектов;
- доступ администратора;
- валидация отрицательных значений КБЖУ;
- валидация пустых названий продуктов;
- валидация некорректного веса записи;
- валидация типа приема пищи;
- фаззинг-тестирование сериализаторов.

---

## Фаззинг-тестирование

Для автоматизированной генерации некорректных данных используется библиотека **Hypothesis**.

Проверяются:

- пробельные названия продуктов;
- отрицательные числовые значения КБЖУ;
- нулевой и отрицательный вес приема пищи;
- некорректные значения типа приема пищи.

Фаззинг-тесты позволяют убедиться, что backend устойчив к неожиданным и некорректным входным данным.

---

## CI

В проекте настроен workflow GitHub Actions:

```
.github/workflows/ci.yml
```

При push или pull request в main автоматически выполняются:

- backend-тесты;
- запуск PostgreSQL service container;
- frontend build;
- сборка Docker-образов backend и frontend.

---

## Контейнерная схема

```
docker-compose.yml
├── db        → PostgreSQL
├── backend   → Django + Gunicorn
└── frontend  → Nginx + React build
```

---

## Использование Twelve-Factor App

В проекте применены отдельные принципы методологии Twelve-Factor App:

- конфигурация через переменные окружения;
- независимые сервисы хранения данных;
- явное управление зависимостями;
- разделение build и run этапов;
- порт как экспортируемый сервис;
- воспроизводимый запуск через Docker.
