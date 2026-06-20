"""
config.py — Environment configuration for the Million Mint AI Terminal worker.

Loads settings from .env file (if present) and falls back to sensible defaults.
"""

import os
from dotenv import load_dotenv

# Load .env from the same directory as this file
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379')
COINGECKO_API_KEY: str = os.getenv('COINGECKO_API_KEY', '')
POLL_INTERVAL_SECONDS: int = int(os.getenv('POLL_INTERVAL_SECONDS', '60'))
COINGECKO_BASE_URL: str = os.getenv('COINGECKO_BASE_URL', 'https://api.coingecko.com/api/v3')
