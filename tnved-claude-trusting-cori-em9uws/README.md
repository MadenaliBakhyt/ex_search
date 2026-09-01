# ТН ВЭД Search API

Приложение для поиска информации по коду ТН ВЭД. Backend на FastAPI + PostgreSQL, frontend на React + TypeScript + TailwindCSS.

## Запуск через Docker

```bash
docker compose --profile local-db up -d
```

Флаг `--profile local-db` поднимает и собственный контейнер PostgreSQL
(данные пустые, миграции нужно применить и импортировать `tnved.xlsx`
самостоятельно — см. ниже). Если у вас уже есть готовая база с данными,
контейнер БД не нужен вообще — см. следующий раздел.

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- PostgreSQL: localhost:5432

## Подключение к существующей базе данных

Если PostgreSQL с таблицами и данными ТН ВЭД уже есть — не поднимайте
контейнер `db` (профиль `local-db` просто не указывается), а вместо этого
задайте `DATABASE_URL`, указывающий на вашу базу:

```bash
docker compose up -d
```

(без `--profile local-db` сервис `db` из compose-файла не запускается.)

### База уже работает на этом же сервере (не в Docker)

Контейнер `backend` умеет достучаться до Postgres на хосте через
`host.docker.internal` (это уже настроено в `docker-compose.yml` через
`extra_hosts`). Нужно:

1. Разрешить PostgreSQL слушать не только `localhost`. В `postgresql.conf`
   (путь узнать так: `sudo -u postgres psql -c "SHOW config_file;"`):
   ```
   listen_addresses = '*'
   ```
2. Разрешить подключения из docker-сети в `pg_hba.conf` (путь — `SHOW hba_file;`):
   ```
   host    tnved    <ваш_пользователь>    172.17.0.0/16    scram-sha-256
   ```
   (`172.17.0.0/16` — стандартная docker bridge-сеть; если у вас другая,
   проверьте `docker network inspect bridge --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}'`).
3. Перезапустить PostgreSQL: `sudo systemctl restart postgresql`.
4. Если стоит `ufw` — разрешить доступ к 5432 из docker-сети:
   `sudo ufw allow from 172.17.0.0/16 to any port 5432`.
5. Запустить стек с нужным `DATABASE_URL`:
   ```bash
   DATABASE_URL=postgresql+asyncpg://<пользователь>:<пароль>@host.docker.internal:5432/<база> \
     docker compose up --build -d
   ```

Либо создайте `.env` рядом с `docker-compose.yml` с той же переменной —
тогда просто `docker compose up -d` подхватит её без явного экспорта.

### База в другом контейнере или на удалённом хосте

Просто укажите `DATABASE_URL` с адресом, который реально доступен из сети,
в которой работает `backend` (для отдельного Docker-контейнера — либо общий
`docker network`, либо адрес хоста и проброшенный порт; для удалённой БД —
её публичный/внутренний адрес). `host.docker.internal` в этих случаях не
нужен, `extra_hosts` в compose-файле ему не мешает.

### Проверка

```bash
curl http://localhost:8000/api/code/0101210000   # должен вернуть реальную запись
```

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
