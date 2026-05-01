from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class AnalyzeRequest(BaseModel):
    repo_url: str


class AskRequest(BaseModel):
    repo_url: str
    question: str


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "entry", "config", "service", "component", "other"
    path: str


class GraphEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None


class HighImpactFile(BaseModel):
    path: str
    reason: str
    type: str  # "entry", "config", "core"
    summary: str


class OnboardingStep(BaseModel):
    step: int
    file: str
    action: str
    why: str


class FileSummary(BaseModel):
    path: str
    summary: str
    type: str


class RepoOverview(BaseModel):
    name: str
    description: Optional[str]
    language: Optional[str]
    stars: int
    forks: int
    default_branch: str
    total_files: int
    top_languages: List[str]
    owner: str
    url: str


class AnalyzeResponse(BaseModel):
    repoOverview: RepoOverview
    graphNodes: List[GraphNode]
    graphEdges: List[GraphEdge]
    highImpactFiles: List[HighImpactFile]
    onboardingPath: List[OnboardingStep]
    filesWithSummaries: List[FileSummary]
    sampleQuestions: List[str]


class AskResponse(BaseModel):
    answer: str
