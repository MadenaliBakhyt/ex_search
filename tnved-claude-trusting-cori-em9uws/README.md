# ТН ВЭД Search API

Приложение для поиска информации по коду ТН ВЭД. Backend на FastAPI + PostgreSQL, frontend на React + TypeScript + TailwindCSS.

## Запуск через Docker

```bash
docker compose up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- PostgreSQL: localhost:5432

## Импорт данных из Excel

```bash
# При запущенном PostgreSQL (через Docker или локально)
cd backend
pip install -r requirements.txt

# Применить миграции
alembic upgrade head

# Импортировать данные
python import_excel.py tnved.xlsx
```

Формат Excel: первые 4 колонки — Код, Наименование, Тариф, Подробности. Все остальные колонки объединяются в массив документов.

## Локальный запуск без Docker

### PostgreSQL

Создать базу данных `tnved`:

```bash
createdb tnved
```

### Backend

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:5173, запросы к `/api` проксируются на backend.

## API

### Поиск по коду

```bash
curl http://localhost:8000/api/code/0101210000
```

```json
{
  "code": "0101210000",
  "name": "Лошади чистопородные",
  "tariff": "0%",
  "details": "подробнее",
  "documents": [
    "Внешнеэкономический контракт",
    "Коммерческий инвойс",
    "CMR"
  ]
}
```

### Поиск по наименованию

```bash
curl "http://localhost:8000/api/search?q=лошади"
```

```json
[
  {
    "code": "0101210000",
    "name": "Лошади чистопородные"
  }
]
```

## Переменные окружения (.env)

### Где создавать

Файл `.env` создаётся в папке `backend/`:

```
project/
├── backend/
│   ├── .env          <-- здесь
│   ├── app/
│   ├── alembic/
│   ├── import_excel.py
│   └── ...
├── frontend/
└── docker-compose.yml
```

Скопируйте из примера:

```bash
cd backend
cp .env.example .env
```

### Поля

| Переменная | Обязательная | Описание | Значение по умолчанию |
|---|---|---|---|
| `DATABASE_URL` | Да | Строка подключения к PostgreSQL. Формат: `postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DBNAME` | `postgresql+asyncpg://postgres:postgres@localhost:5432/tnved` |
| `SEARCH_LIMIT` | Нет | Максимальное количество результатов при поиске по наименованию (`GET /api/search`) | `50` |

### Примеры .env

**Локальная разработка:**

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/tnved
SEARCH_LIMIT=50
```

**Docker (backend подключается к контейнеру `db`):**

При запуске через `docker compose up` переменная `DATABASE_URL` задаётся в `docker-compose.yml` автоматически, файл `.env` не нужен.

```yaml
# docker-compose.yml уже содержит:
environment:
  DATABASE_URL: postgresql+asyncpg://postgres:postgres@db:5432/tnved
```

**Продакшн (пример):**

```env
DATABASE_URL=postgresql+asyncpg://tnved_user:strong_password@db.example.com:5432/tnved_prod
SEARCH_LIMIT=100
```

### Важно

- Файл `.env` добавлен в `.gitignore` — он не попадает в git
- Для справки используйте `.env.example`
- При запуске через Docker `.env` не требуется — переменные заданы в `docker-compose.yml`
- При локальной разработке `.env` обязателен (или нужно задать переменные окружения вручную)
