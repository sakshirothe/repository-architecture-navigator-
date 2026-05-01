import os
import requests
from typing import Optional, Dict, Any, List


GITHUB_API_BASE = "https://api.github.com"


def get_headers() -> Dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def parse_github_url(url: str):
    """Extract owner and repo from GitHub URL."""
    url = url.strip().rstrip("/")
    # Handle various GitHub URL formats
    if "github.com" not in url:
        raise ValueError("Not a valid GitHub URL")

    parts = url.split("github.com/")[-1].split("/")
    if len(parts) < 2:
        raise ValueError("Could not extract owner and repo from URL")

    owner = parts[0]
    repo = parts[1].replace(".git", "")
    return owner, repo


def fetch_repo_metadata(owner: str, repo: str) -> Dict[str, Any]:
    """Fetch repository metadata from GitHub API."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
    response = requests.get(url, headers=get_headers(), timeout=15)

    if response.status_code == 404:
        raise ValueError(f"Repository '{owner}/{repo}' not found. It may be private or doesn't exist.")
    elif response.status_code == 403:
        data = response.json()
        if "rate limit" in data.get("message", "").lower():
            raise ValueError("GitHub API rate limit exceeded. Add GITHUB_TOKEN to .env to increase limits.")
        raise ValueError("Access forbidden. Repository may be private.")
    elif response.status_code != 200:
        raise ValueError(f"GitHub API error: {response.status_code} - {response.text}")

    return response.json()


def fetch_file_tree(owner: str, repo: str, branch: str) -> List[Dict[str, Any]]:
    """Fetch recursive file tree from GitHub API."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
    response = requests.get(url, headers=get_headers(), timeout=30)

    if response.status_code == 409:
        raise ValueError("Repository is empty or has no commits.")
    elif response.status_code == 403:
        raise ValueError("Cannot access repository tree. It may be private.")
    elif response.status_code != 200:
        raise ValueError(f"Failed to fetch file tree: {response.status_code}")

    data = response.json()
    if data.get("truncated"):
        # Tree was truncated, we still proceed with what we have
        pass

    return data.get("tree", [])


def fetch_file_content(owner: str, repo: str, path: str) -> Optional[str]:
    """Fetch content of a specific file."""
    import base64
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    response = requests.get(url, headers=get_headers(), timeout=10)

    if response.status_code != 200:
        return None

    data = response.json()
    if data.get("encoding") == "base64" and data.get("content"):
        try:
            content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
            return content[:3000]  # Limit to first 3000 chars
        except Exception:
            return None

    return None


def fetch_repo_languages(owner: str, repo: str) -> Dict[str, int]:
    """Fetch programming languages used in the repo."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/languages"
    response = requests.get(url, headers=get_headers(), timeout=10)

    if response.status_code == 200:
        return response.json()
    return {}
