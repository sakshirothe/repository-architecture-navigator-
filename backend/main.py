import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from schemas import AnalyzeRequest, AnalyzeResponse, AskRequest, AskResponse
from services.analyzer import analyze_repository
from services.qa import answer_question

app = FastAPI(
    title="Repository Architecture Navigator API",
    description="Analyzes GitHub repositories and returns architecture insights.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "openai_enabled": bool(os.environ.get("OPENAI_API_KEY")),
        "github_token": bool(os.environ.get("GITHUB_TOKEN")),
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from schemas import AnalyzeRequest, AnalyzeResponse, AskRequest, AskResponse
from services.analyzer import analyze_repository
from services.qa import answer_question

app = FastAPI(
    title="Repository Architecture Navigator API",
    description="Analyzes GitHub repositories and returns architecture insights.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://repository-architecture-navigator-7.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "openai_enabled": bool(os.environ.get("OPENAI_API_KEY")),
        "github_token": bool(os.environ.get("GITHUB_TOKEN")),
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Analyze a public GitHub repository and return architecture insights.
    """
    if not request.repo_url or "github.com" not in request.repo_url:
        raise HTTPException(status_code=400, detail="Please provide a valid GitHub repository URL.")

    try:
        result = analyze_repository(request.repo_url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    """
    Answer a question about a GitHub repository.
    """
    if not request.repo_url or "github.com" not in request.repo_url:
        raise HTTPException(status_code=400, detail="Please provide a valid GitHub repository URL.")
    if not request.question or len(request.question.strip()) < 3:
        raise HTTPException(status_code=400, detail="Please provide a valid question.")

    try:
        answer = answer_question(request.repo_url, request.question)
        return AskResponse(answer=answer)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Q&A failed: {str(e)}")
