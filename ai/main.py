"""BhashaBridge Python AI Engine.

FastAPI service that exposes the multilingual AI assistant backed by OpenRouter.

Endpoints:
    GET  /health  -> service health check
    POST /chat   -> generate a multilingual AI reply

The OpenRouter integration is configured through environment variables:
    OPENROUTER_API_KEY - OpenRouter API key (https://openrouter.ai/keys)
    OPENROUTER_MODEL   - OpenRouter model ID (e.g. openai/gpt-4o-mini, meta-llama/llama-3.3-70b-instruct:free)

The request/response contract with the Java backend:
    Request:  { "message": "Hello", "language": "en", "history": [ { "role": "user", "text": "..." }, ... ] }
    Response: { "response": "The AI answer in the selected language" }
"""

import os
from typing import List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(
    title="BhashaBridge AI Engine",
    description="Multilingual AI voice assistant backend (Telugu, Hindi, English) powered by OpenRouter.",
)

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "")
OPENROUTER_TIMEOUT = float(os.getenv("OPENROUTER_TIMEOUT", "30"))

SYSTEM_PROMPT = (
    "You are BhashaBridge, a friendly multilingual AI assistant for the BhashaBridge app. "
    "You can converse in Telugu, Hindi and English (Hinglish is welcome). "
    "Always answer the user's question in the language they used or the language selected in the app. "
    "Keep answers clear, concise and helpful. If you do not know something, say so honestly. "
    "The user may ask simple questions about BhashaBridge itself; answer those too."
)


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    text: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User message in the selected language")
    language: str = Field("en", pattern="^(en|hi|te)$", description="Response language code: en, hi or te")
    history: Optional[List[ChatMessage]] = Field(default=None, description="Optional prior conversation turns")


class ChatResponse(BaseModel):
    response: str = Field(..., description="AI generated response text")


@app.get("/health")
async def health():
    return {"status": "UP"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    api_key = OPENROUTER_API_KEY
    model = OPENROUTER_MODEL

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "OpenRouter API key is not configured",
                "message": "The AI engine is missing the OPENROUTER_API_KEY environment variable. Set it in ai/.env and restart the service.",
            },
        )

    if not model:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "OpenRouter model is not configured",
                "message": "The AI engine is missing the OPENROUTER_MODEL environment variable. Set it in ai/.env and restart the service.",
            },
        )

    messages: List[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in request.history or []:
        messages.append({"role": turn.role, "content": turn.text})
    messages.append({"role": "user", "content": request.message})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 1024,
        # Some configured models are "reasoning" models: they can spend the whole
        # max_tokens budget on hidden reasoning and return empty/truncated content
        # (especially for Indic scripts). We want the visible answer only.
        "reasoning": {"enabled": False},
    }

    async with httpx.AsyncClient(timeout=OPENROUTER_TIMEOUT) as client:
        try:
            upstream = await client.post(
                OPENROUTER_BASE_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "BhashaBridge",
                },
            )
        except httpx.TimeoutException as exc:
            raise HTTPException(
                status_code=504,
                detail={"error": "AI provider timed out", "message": "The AI provider did not respond in time."},
            )
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=502,
                detail={"error": "AI provider request failed", "message": str(exc)},
            )

        if upstream.status_code == 401:
            raise HTTPException(
                status_code=401,
                detail={"error": "Invalid OpenRouter API key", "message": "The configured OpenRouter API key was rejected by the provider."},
            )
        if upstream.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail={"error": "OpenRouter rate limit exceeded", "message": "The AI provider rate limit was reached. Please try again later."},
            )
        if upstream.status_code >= 400:
            try:
                detail = upstream.json().get("error", {}).get("message") or upstream.text
            except Exception:
                detail = upstream.text
            raise HTTPException(
                status_code=502,
                detail={"error": "AI provider error", "message": str(detail)},
            )

        data = upstream.json()
        choices = data.get("choices") or []
        choice = choices[0] if choices else {}
        message = choice.get("message") or {}
        content = message.get("content")
        if not content:
            finish_reason = choice.get("finish_reason")
            raise HTTPException(
                status_code=502,
                detail={
                    "error": "AI provider returned an empty response",
                    "message": (
                        f"The model returned no text (finish_reason={finish_reason}). "
                        "If this persists, try a different OPENROUTER_MODEL."
                    ),
                },
            )

        return ChatResponse(response=content.strip())
