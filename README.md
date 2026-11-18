# 🌉 BhashaBridge – HackWithAditya 2026

**AI for Bharat** — a multilingual public-service information assistant for Telugu, Hindi and English.

BhashaBridge is **not** a generic chatbot. It is built to help people understand government
schemes, public-service instructions, application forms and official notices in the language
they are most comfortable with.

> **Status:** Phases 1–4 complete and verified (architecture, Java backend, Python AI engine,
> live OpenRouter LLM connection). RAG, OCR, Sarvam voice and final frontend integration are
> the next phases.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Implemented Phases](#implemented-phases)
5. [API Reference](#api-reference)
6. [Setup](#setup)
7. [Configuration](#configuration)
8. [Running the Project](#running-the-project)
9. [Verified Test Results](#verified-test-results)
10. [Security Notes](#security-notes)
11. [Troubleshooting](#troubleshooting)
12. [Roadmap](#roadmap)

---

## Architecture

```
┌─────────────────┐     HTTP/JSON      ┌──────────────────────┐
│  React Frontend │ ─────────────────► │  Java Spring Boot    │
│  (Vite :5173)   │ ◄───────────────── │  Backend (:8080/api) │
└─────────────────┘                    └──────────┬───────────┘
                                                  │ HTTP/JSON
                                                  ▼
                                       ┌──────────────────────┐
                                       │  Python FastAPI      │
                                       │  AI Engine (:8000)   │
                                       └──────────┬───────────┘
                                                  │ HTTPS + Bearer
                                                  ▼
                                       ┌──────────────────────┐
                                       │  OpenRouter API      │
                                       │  (LLM provider)      │
                                       └──────────────────────┘
```

- **React** sends `{ message, language }` to the Java backend.
- **Java** validates the request and forwards it to the Python AI engine.
- **Python** calls OpenRouter with the configured model, then returns the generated text.
- **Java** forwards the real AI response (and real error status/message) back to React.

No demo mode, no hardcoded responses: every answer comes from the configured LLM provider.

---

## Project Structure

```
BhashaBridge-HackWithAditya-2026/
├── frontend/                        # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Chat fetch integration + error state
│   │   │   ├── ChatInterface.jsx    # Chat UI, loading/error states
│   │   │   ├── LanguageSelector.jsx # en / hi / te selector
│   │   │   ├── LiveVoiceCard.jsx    # Voice UI placeholder (Phase 7)
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   ├── RecentSessions.jsx
│   │   │   └── Placeholder.jsx
│   │   ├── store/index.js           # Redux store
│   │   ├── utils/speech.js          # Web Speech helpers (Phase 7)
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   ├── .env.example                 # VITE_BACKEND_URL
│   └── package.json
│
├── backend/                         # Java 21 + Spring Boot 3.3.5 + Maven
│   ├── src/main/java/com/bhashabridge/
│   │   ├── BhashaBridgeApplication.java
│   │   ├── config/CorsConfig.java
│   │   ├── controller/
│   │   │   ├── ChatController.java  # POST /api/chat
│   │   │   └── HealthController.java# GET  /api/health
│   │   ├── dto/
│   │   │   ├── ChatRequest.java
│   │   │   └── ChatResponse.java
│   │   ├── exception/GlobalExceptionHandler.java
│   │   └── service/ChatService.java # Java → Python call, status/error passthrough
│   ├── src/main/resources/application.properties
│   ├── .env.example
│   └── pom.xml
│
├── ai/                              # Python 3.11 + FastAPI
│   ├── main.py                      # /health and /chat, OpenRouter integration
│   ├── requirements.txt
│   ├── .env.example                 # placeholders only
│   └── .env                         # local secrets (gitignored, never committed)
│
├── .env.example                     # root template
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, Redux Toolkit, lucide-react |
| Main backend | Java 21, Spring Boot 3.3.5, Maven, Bean Validation |
| AI engine | Python 3.11, FastAPI, Pydantic v2, httpx, python-dotenv |
| LLM provider | OpenRouter (`https://openrouter.ai/api/v1/chat/completions`) |
| Planned | FAISS + multilingual embeddings (RAG), PaddleOCR, Sarvam Saaras/Bulbul, PostgreSQL |

---

## Implemented Phases

### ✅ Phase 1 — Architecture & Folder Structure
Clean separation of frontend, Java backend and Python AI engine; environment templates;
`.gitignore` that keeps secrets and build artifacts out of version control.

### ✅ Phase 2 — Java Spring Boot REST Backend
- `POST /api/chat` and `GET /api/health` under the `/api` context path (port 8080).
- Bean-validation of `message` (1–1000 chars) and `language` (`en|hi|te`).
- `ChatService` calls the Python engine, forwards the real response body **and** status
  code (401 / 429 / 502 / 503 / 504).
- CORS restricted to `http://localhost:5173`.
- Global exception handler for validation, malformed JSON and upstream errors.

### ✅ Phase 3 — Python FastAPI AI Engine
- `GET /health` → `{"status":"UP"}`.
- `POST /chat` accepts `{ "message", "language", "history"? }` and returns `{ "response" }`.
- Multilingual system prompt; answers in the selected language (en / hi / te, Hinglish welcome).
- Async `httpx.AsyncClient` call to OpenRouter, Bearer auth, dynamic model, configurable timeout.
- Config loaded from environment variables, `ai/.env` loaded automatically with `python-dotenv`.
- Clear error mapping, no secrets in error messages.

### ✅ Phase 4 — Actual OpenRouter LLM Connection
- Real, verified round-trip: **React → Java → Python → OpenRouter → back**.
- Configured model: `inclusionai/ling-3.2-flash:free` (free tier, `cost: 0`).
- Reasoning is explicitly disabled per request (`"reasoning": {"enabled": false}`) because
  reasoning models can spend the entire token budget on hidden reasoning and return
  empty/truncated content — especially for Indic scripts.
- The Java layer uses the JDK `HttpClient` over HTTP/1.1 so 4xx responses (e.g. 401 invalid
  key) are read correctly instead of being lost by `HttpURLConnection`'s streamed-POST quirk.

---

## API Reference

### Java backend (`http://localhost:8080/api`)

#### `GET /api/health`
```json
{ "status": "UP" }
```

#### `POST /api/chat`
Request:
```json
{ "message": "నమస్తే, భాషాబ్రిడ్జ్ అంటే ఏమిటి?", "language": "te" }
```
Response `200`:
```json
{ "response": "నమస్తే! భాషాబ్రిడ్జ్ …" }
```
Errors:
```json
{ "error": "Invalid OpenRouter API key" }        // 401
{ "error": "OpenRouter rate limit exceeded" }    // 429
{ "error": "AI provider error" }                 // 502
{ "error": "OpenRouter API key is not configured" } // 503
{ "error": "AI provider timed out" }             // 504
```

### Python AI engine (`http://localhost:8000`)

#### `GET /health`
```json
{ "status": "UP" }
```

#### `POST /chat`
Request:
```json
{
  "message": "Hello",
  "language": "en",
  "history": [{ "role": "user", "text": "Hi" }]
}
```
Response `200`:
```json
{ "response": "Actual AI-generated response" }
```
Error shape:
```json
{
  "detail": {
    "error": "OpenRouter API key is not configured",
    "message": "The AI engine is missing the OPENROUTER_API_KEY environment variable. Set it in ai/.env and restart the service."
  }
}
```

| Condition | Python status | Java status |
|---|---|---|
| Missing API key | 503 | 503 |
| Missing model | 503 | 503 |
| Invalid API key | 401 | 401 |
| Rate limited | 429 | 429 |
| Provider error | 502 | 502 |
| Provider timeout | 504 | 504 |
| AI engine unreachable | — | 503 |

---

## Setup

### Prerequisites
- **Java 21+** (project targets Java 21)
- **Maven 3.9+**
- **Node.js 20+** (npm 10+)
- **Python 3.11+**
- An **OpenRouter API key** — https://openrouter.ai/keys

### 1. Frontend
```bash
cd frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

### 2. Java backend
```bash
cd backend
mvn package -DskipTests
```
The backend reads `backend/src/main/resources/application.properties`; no secrets are needed there.
See `backend/.env.example` for the available keys.

### 3. Python AI engine
```bash
cd ai
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
```
Then edit `ai/.env` and set:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=inclusionai/ling-3.2-flash:free
OPENROUTER_TIMEOUT=30
```

---

## Configuration

### Where to put the API key
Only in **`ai/.env`**:

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter key (required) |
| `OPENROUTER_MODEL` | OpenRouter model ID (required) |
| `OPENROUTER_TIMEOUT` | Request timeout in seconds (default `30`) |

- `ai/.env` is gitignored and must never be committed.
- `ai/.env.example` contains placeholders only.
- The key is never logged or returned in error messages.

### Frontend
| File | Variable | Value |
|---|---|---|
| `frontend/.env` | `VITE_BACKEND_URL` | `http://localhost:8080/api` |

### Java backend
| Property | Value |
|---|---|
| `server.port` | `8080` |
| `server.servlet.context-path` | `/api` |
| `ai.service.url` | `http://localhost:8000` |
| `cors.allowed-origins` | `http://localhost:5173` |

---

## Running the Project

Start all three services (in separate terminals, in this order):

**1. Python AI engine**
```bash
cd ai
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
→ `http://localhost:8000`

**2. Java backend**
```bash
cd backend
mvn spring-boot:run
# or: java -jar target/bhashabridge-backend-0.0.1-SNAPSHOT.jar
```
→ `http://localhost:8080/api`

**3. React frontend**
```bash
cd frontend
npm run dev
```
→ `http://localhost:5173`

Open `http://localhost:5173`, choose Telugu / Hindi / English, and ask a question.

---

## Verified Test Results

All results below were produced with the real OpenRouter API (no demo mode).

### Successful chat (through Java, full chain)
| Test | Result |
|---|---|
| `GET /api/health` | **200** `{"status":"UP"}` |
| `POST /api/chat` English | **200** real AI reply |
| `POST /api/chat` Telugu | **200** real Telugu reply |
| `POST /api/chat` Hindi | **200** real Hindi reply |
| Upstream check | `provider: "Ant Digital"`, `usage.cost: 0` |

### Error handling
| Test | Response |
|---|---|
| Invalid API key | **401** `Invalid OpenRouter API key` |
| Missing API key | **503** `OpenRouter API key is not configured` |
| Missing model | **503** `OpenRouter model is not configured` |
| Provider timeout | **504** `AI provider timed out` |
| Rate limit | **429** mapping implemented (not triggered live) |
| Invalid request body | **400** validation details |
| AI engine down | **503** `AI service is currently unavailable` |

### Frontend
- `npm run build` passes (2,146 modules, ~664 ms).
- CORS preflight from `http://localhost:5173` → **200** with correct allow headers.
- Loading indicator, error banner with the real backend message, duplicate-send guard,
  Enter-to-send, and language selector all verified.

---

## Security Notes

- `.env` files are ignored at any depth; only `.env.example` placeholders are committed.
- API keys live only in `ai/.env` and are never hardcoded, logged, or returned to clients.
- Error messages are sanitized — no keys, headers or raw upstream bodies are leaked.
- CORS is limited to the local dev origin.
- Avoid collecting unnecessary personal information; future document features should process
  uploads only for the duration needed to answer the user.

> If a key was ever shared publicly (chat, screenshot, commit), rotate it at
> https://openrouter.ai/keys immediately.

---

## Troubleshooting

**`OpenRouter API key is not configured` (503)**
`ai/.env` is missing or not loaded. Confirm the file exists, contains `OPENROUTER_API_KEY`,
and restart uvicorn from inside the `ai/` directory.

**`Invalid OpenRouter API key` (401)**
The key was rejected by OpenRouter. Check it at https://openrouter.ai/keys.

**Empty or truncated replies (502)**
The configured model may be a reasoning model that consumes the token budget internally.
Keep `"reasoning": {"enabled": false}` in the payload, or switch `OPENROUTER_MODEL` to a
non-reasoning model.

**`AI service is currently unavailable` (503)**
The Java backend cannot reach the Python engine. Ensure uvicorn is running on port 8000.

**Frontend shows a network error**
`frontend/.env` must contain `VITE_BACKEND_URL=http://localhost:8080/api`. Restart `npm run dev`
after changing it.

---

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Architecture and folder structure | ✅ Done |
| 2 | Java Spring Boot REST backend | ✅ Done |
| 3 | Python FastAPI AI engine | ✅ Done |
| 4 | Actual LLM connection (OpenRouter) | ✅ Done |
| 5 | RAG document ingestion and retrieval (FAISS, multilingual embeddings) | ⏳ Next |
| 6 | OCR document understanding (PaddleOCR) | ⏳ Planned |
| 7 | Sarvam voice integration (Saaras STT, Bulbul TTS, Web Speech fallback) | ⏳ Planned |
| 8 | React frontend integration (documents, citations, voice) | ⏳ Planned |
| 9 | Testing, README, demo preparation | ⏳ Planned |

Planned capabilities:
- Verified public-service knowledge base with **citations**; say so clearly when information
  cannot be verified.
- PDF/image upload → OCR → summarisation → grounded question answering.
- Agent that routes intent, decides when to search or analyse a document, and asks clarifying
  questions.
- PostgreSQL for session/metadata storage.

---

## License

Built for **HackWithAditya 2026 – AI for Bharat**.
