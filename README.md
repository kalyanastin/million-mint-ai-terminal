# ◈ Million Mint AI Terminal

**AI-Powered Crypto Research Terminal** with tiered access, real-time data streaming, and grounded AI analysis.

## Architecture

```
crypto-terminal/
├── docker-compose.yml    # Redis 7 infrastructure
├── worker/               # Data-pooling daemon (Python)
├── backend/              # FastAPI REST + SSE API
└── frontend/             # Next.js terminal dashboard
```

## Quick Start

### Prerequisites
- **Docker Desktop** (for Redis)
- **Python 3.11+** (for backend + worker)
- **Node.js 20+** (for frontend)

### 1. Start Redis
```bash
docker-compose up -d
```

### 2. Start the Worker
```bash
cd worker
cp .env.example .env          # Edit: add COINGECKO_API_KEY (optional)
pip install -r requirements.txt
python worker.py
```

### 3. Start the Backend API
```bash
cd backend
cp .env.example .env          # Edit: add GEMINI_API_KEY (required)
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start the Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000** — use the tier switcher dropdown to demo Free/Pro/Premium access.

## Tier System

| Feature | Free ($0) | Pro ($3) | Premium ($9) |
|---|:---:|:---:|:---:|
| Market Data | Delayed, rounded | Real-time, full precision | Real-time, full precision |
| AI Research | 5/day | Unlimited | Unlimited |
| Trade Setup Generator | ❌ | 10/day | Unlimited |
| Narrative Scanner | Top 3 | Full | Full |
| Watchlist | ❌ | ✅ | ✅ |
| Whale Alerts | ❌ | ❌ | ✅ |
| Content Generator | ❌ | ❌ | ✅ |

## Mock Auth Tokens

| Token | Tier |
|---|---|
| `free_token` | Free |
| `pro_token` | Pro |
| `premium_token` | Premium |

## Tech Stack
- **Frontend**: Next.js (TypeScript) + Tailwind CSS v4
- **Backend**: Python FastAPI + SSE
- **Worker**: Python async daemon
- **Cache**: Redis 7
- **AI**: Google Gemini 2.0 Flash
- **Data**: CoinGecko API (free tier)
