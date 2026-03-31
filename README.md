# Agency Platform

Digital agency platform with three roles: Owner, Manager, Client.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Fastify (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **AI**: OpenAI (Whisper, GPT-4o)
- **Notifications**: Telegram Bot API
- **Deploy**: Docker + Nginx

## Project Structure

```
agency-platform/
├── apps/
│   ├── api/          # Fastify backend
│   └── web/          # Next.js frontend
├── packages/
│   └── types/        # Shared TypeScript types
├── package.json       # Root package.json (workspaces)
└── turbo.json        # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
```

### Setup Environment Variables

Edit `.env` file with your values:

```env
# Database
DATABASE_URL=postgresql://agency:agency_pass@localhost:5432/agency_db

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Start Development

```bash
# Start PostgreSQL with Docker Compose
docker compose up -d

# Start API and Web (in separate terminals)
pnpm dev
```

API will be available at `http://localhost:3001`
Web will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm build
```

## Development Scripts

| Command | Description |
|----------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm clean` | Clean all build artifacts |

## Database Setup

1. Create Supabase project
2. Run migration: `001_initial.sql` (see `database/` folder)
3. Copy Supabase credentials to `.env`

## Next Steps

- [ ] Auth module (registration, login, JWT)
- [ ] Orders CRUD
- [ ] AI integration (Whisper, GPT-4o)
- [ ] Realtime chat
- [ ] Telegram bot
- [ ] Commission system

## License

Private
