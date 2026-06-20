"""
Gemini AI service for Million Mint AI Terminal with MockGeminiService fallback and Proxy wrapper.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


# ─── Mock Service Class ──────────────────────────────────────────────────────

class MockGeminiService:
    """Mock GeminiService that returns realistic mock responses instead of calling the API."""

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        context: str = "",
        temperature: float = 0.2,
    ) -> str:
        return "This is a mock response from the Million Mint AI Terminal. Please configure a valid GEMINI_API_KEY to receive real AI insights."

    async def generate_trade_setup(self, coin_data: dict) -> dict:
        symbol = coin_data.get("symbol", "BTC").upper()
        price = coin_data.get("current_price", 100.0)
        return {
            "coin_id": coin_data.get("id", "bitcoin"),
            "coin_name": coin_data.get("name", "Bitcoin"),
            "entry": f"Buy stop limit at ${price * 0.99:.2f}",
            "stop_loss": f"${price * 0.95:.2f}",
            "targets": [f"${price * 1.05:.2f}", f"${price * 1.10:.2f}", f"${price * 1.15:.2f}"],
            "risk_reward": "1:3",
            "confidence": "Medium-High",
            "reasoning": f"Support established at the ${price * 0.96:.2f} level with rising RSI."
        }

    async def generate_content_post(
        self,
        topic: str,
        content_type: str,
        context: str = "",
    ) -> dict:
        return {
            "content": f"Here is an engaging social media post about {topic} matching format {content_type}.",
            "format": content_type,
            "hashtags": ["#Crypto", f"#{topic.replace(' ', '')}"]
        }

    async def generate_narrative_summary(self, sector_data: dict) -> str:
        return "The sector shows a strong bullish trend with increased volume and positive sentiment."


# ─── Service Class ───────────────────────────────────────────────────────────

class GeminiService:
    """Async wrapper around the Google GenAI Gemini models."""

    MODEL = "gemini-2.0-flash"

    def __init__(self, api_key: str) -> None:
        self.client = genai.Client(api_key=api_key)

    # ── Generic generation ───────────────────────────────────────────────

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        context: str = "",
        temperature: float = 0.2,
    ) -> str:
        """Generate a free-form text response from Gemini."""
        full_prompt = f"{context}\n\n{prompt}" if context else prompt
        try:
            response = await self.client.aio.models.generate_content(
                model=self.MODEL,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    system_instruction=system_instruction,
                    max_output_tokens=2048,
                ),
            )
            return response.text or "No response generated."
        except Exception as exc:
            logger.error("Gemini generate_response error: %s", exc)
            return (
                "I'm having trouble processing your request right now. "
                "Please try again in a moment."
            )

    # ── Trade setup ──────────────────────────────────────────────────────

    async def generate_trade_setup(self, coin_data: dict) -> dict:
        """Generate a structured trade setup for a given coin."""
        system_instruction = (
            "You are a crypto technical analyst. Generate a trade setup "
            "based ONLY on the provided market data. Output valid JSON with "
            "keys: entry, stop_loss, targets (array of 3 strings), "
            "risk_reward, confidence (Low/Medium/Medium-High/High), "
            "reasoning (1-2 sentences). Use the actual price data "
            "provided — do not hallucinate numbers."
        )
        context = f"Market data for analysis:\n{json.dumps(coin_data, indent=2)}"

        try:
            raw = await self.generate_response(
                prompt="Generate a trade setup for this coin based on the market data.",
                system_instruction=system_instruction,
                context=context,
                temperature=0.2,
            )
            return self._parse_json_from_text(raw)
        except Exception as exc:
            logger.error("generate_trade_setup error: %s", exc)
            return {
                "entry": "N/A",
                "stop_loss": "N/A",
                "targets": ["N/A", "N/A", "N/A"],
                "risk_reward": "N/A",
                "confidence": "Low",
                "reasoning": "Unable to generate trade setup at this time.",
            }

    # ── Content generation ───────────────────────────────────────────────

    async def generate_content_post(
        self,
        topic: str,
        content_type: str,
        context: str = "",
    ) -> dict:
        """Generate social-media-ready crypto content."""
        system_instruction = (
            "You are a viral crypto content creator for Binance Square. "
            "Create engaging, data-backed content. Include emojis, hashtags, "
            "and engagement hooks. Match the requested format."
        )

        format_instructions: dict[str, str] = {
            "thread": (
                "Create a Twitter/X thread with 5-7 connected posts. "
                "Number each post. Start with a hook that grabs attention. "
                "End with a call to action."
            ),
            "alpha_call": (
                "Create an urgent, actionable alpha call. Include entry, "
                "targets, stop-loss, and reasoning. Make it feel exclusive "
                "and time-sensitive."
            ),
            "market_update": (
                "Create an analytical market update. Cover key metrics, "
                "notable movers, and outlook. Use data-driven language and "
                "maintain objectivity."
            ),
            "educational": (
                "Create explanatory educational content. Break down the "
                "concept clearly. Use analogies and examples. Make it "
                "accessible to beginners."
            ),
        }

        format_inst = format_instructions.get(content_type, format_instructions["thread"])
        full_prompt = (
            f"Topic: {topic}\n"
            f"Format: {content_type}\n"
            f"Instructions: {format_inst}"
        )

        try:
            raw = await self.generate_response(
                prompt=full_prompt,
                system_instruction=system_instruction,
                context=context,
                temperature=0.7,
            )
            # Extract hashtags from the generated content
            hashtags = re.findall(r"#\w+", raw)
            return {
                "content": raw,
                "format": content_type,
                "hashtags": list(dict.fromkeys(hashtags))[:10],  # dedupe, cap at 10
            }
        except Exception as exc:
            logger.error("generate_content_post error: %s", exc)
            return {
                "content": "Unable to generate content at this time.",
                "format": content_type,
                "hashtags": [],
            }

    # ── Narrative summary ────────────────────────────────────────────────

    async def generate_narrative_summary(self, sector_data: dict) -> str:
        """Generate a brief 1-sentence summary of a sector trend."""
        system_instruction = (
            "You are a crypto market analyst. Provide a brief 1-sentence "
            "summary of the sector trend described in the data."
        )
        context = json.dumps(sector_data, indent=2)
        return await self.generate_response(
            prompt="Summarise this sector trend in one sentence.",
            system_instruction=system_instruction,
            context=context,
            temperature=0.3,
        )

    # ── Helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _parse_json_from_text(text: str) -> dict:
        """Extract the first JSON object from an LLM response string."""
        # Try to find a JSON block in markdown fences first
        fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if fence_match:
            return json.loads(fence_match.group(1))
        # Fallback: find raw braces
        brace_match = re.search(r"\{.*\}", text, re.DOTALL)
        if brace_match:
            return json.loads(brace_match.group(0))
        raise ValueError("No JSON object found in model response")


# ─── Proxy Class for Lifespan Initialisation ───────────────────────────

class GeminiServiceProxy:
    """Proxy object that allows global dynamic re-binding of the service delegate."""

    def __init__(self) -> None:
        self._delegate = MockGeminiService()

    def set_delegate(self, delegate: GeminiService | MockGeminiService) -> None:
        self._delegate = delegate

    async def generate_response(self, *args, **kwargs) -> str:
        return await self._delegate.generate_response(*args, **kwargs)

    async def generate_trade_setup(self, *args, **kwargs) -> dict:
        return await self._delegate.generate_trade_setup(*args, **kwargs)

    async def generate_content_post(self, *args, **kwargs) -> dict:
        return await self._delegate.generate_content_post(*args, **kwargs)

    async def generate_narrative_summary(self, *args, **kwargs) -> str:
        return await self._delegate.generate_narrative_summary(*args, **kwargs)

    def __bool__(self) -> bool:
        return True


# Global Proxy Singleton
gemini_service = GeminiServiceProxy()


def init_gemini(api_key: str) -> None:
    """Initialise the module-level GeminiService or MockGeminiService."""
    global gemini_service
    if api_key and api_key.strip():
        try:
            real_service = GeminiService(api_key)
            gemini_service.set_delegate(real_service)
            logger.info("Gemini service initialised with API key")
        except Exception as exc:
            logger.warning("Gemini service init failed, falling back to mock: %s", exc)
            gemini_service.set_delegate(MockGeminiService())
    else:
        logger.warning("GEMINI_API_KEY not set — using MockGeminiService fallback")
        gemini_service.set_delegate(MockGeminiService())
