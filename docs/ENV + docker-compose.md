Четыре файла — вот логика по каждому.

**`.env.example`** — это шаблон который коммитишь в git. Реальный `.env` в `.gitignore` всегда. Для генерации JWT-секретов: `openssl rand -hex 64` — запускаешь дважды, получаешь два разных секрета.

**`docker-compose.yml`** — для локальной разработки. `schema.sql` монтируется напрямую в `docker-entrypoint-initdb.d` — при первом запуске PostgreSQL сам накатит всю схему.

**`docker-compose.prod.yml`** — прод-версия без bind-mount томов, с Nginx в качестве reverse proxy перед API и Web. Образы берёт из GitHub Container Registry — это стандартный CI/CD паттерн.

**`config.ts`** — самое важное здесь: `envSchema.safeParse(process.env)` с Zod валидацией. Если при старте сервера нет нужной переменной или она неправильного формата — сервер не запустится, а в консоли будет чёткий список что именно отсутствует. Никаких `undefined is not a function` в рантайме.

**Команды для старта локально:**
```bash
cp .env.example .env        # заполняешь переменные
docker compose up -d        # поднимает postgres
npm run dev                 # запускаешь api и web
```

---