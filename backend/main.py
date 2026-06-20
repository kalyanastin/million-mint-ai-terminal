from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from services.redis_service import init_redis, close_redis
from services.gemini_service import init_gemini
from routes import market, stream, ai, trade_setup, content_gen, narratives, whale, trending

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_redis(settings.REDIS_URL)
    init_gemini(settings.GEMINI_API_KEY)
    yield
    # Shutdown
    await close_redis()

app = FastAPI(
    title="Million Mint AI Terminal API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(','),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Mount routes
app.include_router(market.router)
app.include_router(stream.router)
app.include_router(ai.router)
app.include_router(trade_setup.router)
app.include_router(content_gen.router)
app.include_router(narratives.router)
app.include_router(whale.router)
app.include_router(trending.router)

@app.get('/health')
async def health_check():
    return {'status': 'ok', 'service': 'million-mint-api'}
