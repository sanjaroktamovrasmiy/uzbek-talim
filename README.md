# 📚 Uzbek Ta'lim - Ta'lim Markazi Platformasi

Professional ta'lim markazlari uchun Telegram bot va Web application integratsiyasi.

## 🏗️ Arxitektura

```
uzbek-talim/
├── apps/
│   ├── api/          # FastAPI backend
│   ├── bot/          # Telegram bot (aiogram)
│   └── web/          # React frontend
├── packages/
│   ├── shared/       # Shared utilities
│   └── db/           # Database models & migrations
├── infrastructure/
│   ├── docker/       # Docker configurations
│   └── k8s/          # Kubernetes (optional)
└── tests/            # Integration tests
```

## 🚀 Tez Boshlash

### Talablar
- Python 3.10+
- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose

### O'rnatish

```bash
# 1. Reponi klonlash
git clone <repository-url>
cd uzbek-talim

# 2. Environment sozlash
cp .env.example .env

# 3. Docker bilan ishga tushirish
docker-compose up -d

# 4. Migratsiyalar
make migrate

# 5. Development server
make dev
```

## 🛠️ Texnologiyalar

### Backend
- **FastAPI** - Yuqori samarali API framework
- **SQLAlchemy 2.0** - ORM
- **Alembic** - Database migratsiyalar
- **Pydantic V2** - Data validatsiya
- **Redis** - Caching & session

### Telegram Bot
- **Aiogram 3.x** - Async Telegram framework
- **FSM** - Finite State Machine
- **Middleware** - Custom middlewares

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Tailwind CSS** - Styling

### Database
- **PostgreSQL 15** - Primary database
- **Redis** - Cache & sessions

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **pytest** - Backend testing
- **Vitest** - Frontend testing

## 📁 Loyiha Strukturasi

```
.
├── apps/
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── api/           # API endpoints
│   │   │   ├── core/          # Core configurations
│   │   │   ├── models/        # SQLAlchemy models
│   │   │   ├── schemas/       # Pydantic schemas
│   │   │   ├── services/      # Business logic
│   │   │   ├── repositories/  # Data access layer
│   │   │   └── utils/         # Utilities
│   │   ├── tests/
│   │   └── pyproject.toml
│   │
│   ├── bot/                    # Telegram Bot
│   │   ├── src/
│   │   │   ├── handlers/      # Message handlers
│   │   │   ├── keyboards/     # Inline & reply keyboards
│   │   │   ├── middlewares/   # Custom middlewares
│   │   │   ├── states/        # FSM states
│   │   │   ├── filters/       # Custom filters
│   │   │   └── utils/         # Bot utilities
│   │   ├── tests/
│   │   └── pyproject.toml
│   │
│   └── web/                    # Frontend
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── pages/         # Page components
│       │   ├── hooks/         # Custom hooks
│       │   ├── services/      # API services
│       │   ├── store/         # State management
│       │   └── types/         # TypeScript types
│       ├── tests/
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared Python package
│   │   ├── src/
│   │   │   ├── constants/     # Shared constants
│   │   │   ├── exceptions/    # Custom exceptions
│   │   │   ├── events/        # Event system
│   │   │   └── utils/         # Shared utilities
│   │   └── pyproject.toml
│   │
│   └── db/                     # Database package
│       ├── src/
│       │   ├── models/        # SQLAlchemy models
│       │   ├── migrations/    # Alembic migrations
│       │   └── repositories/  # Base repositories
│       ├── alembic.ini
│       └── pyproject.toml
│
├── infrastructure/
│   ├── docker/
│   │   ├── api.Dockerfile
│   │   ├── bot.Dockerfile
│   │   └── web.Dockerfile
│   └── scripts/               # Deployment scripts
│
├── tests/                      # Integration tests
│   └── integration/
│
├── .github/
│   └── workflows/             # CI/CD
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── Makefile
├── pyproject.toml             # Root Python config
└── .env.example
```

## 🔧 Development

### Lokal Development

```bash
# Virtual environment
python -m venv .venv
source .venv/bin/activate

# Dependencies
pip install -e "packages/shared[dev]"
pip install -e "packages/db[dev]"
pip install -e "apps/api[dev]"
pip install -e "apps/bot[dev]"

# Frontend
cd apps/web && npm install

# Run all services
make dev
```

### Testing

```bash
# All tests
make test

# Backend tests
make test-api

# Bot tests
make test-bot

# Frontend tests
make test-web

# Integration tests
make test-integration
```

## 📄 License

MIT License - [LICENSE](LICENSE)

