import os
from typing import List, Dict, Optional
from services.github_service import (
    fetch_repo_metadata, fetch_file_tree, fetch_file_content, parse_github_url
)
from schemas import FileSummary


def generate_file_summaries_openai(
    owner: str, repo: str, files: List[Dict], branch: str
) -> List[FileSummary]:
    """Generate summaries using OpenAI API."""
    from openai import OpenAI

    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    summaries = []

    for f in files[:12]:  # Limit API calls
        path = f["path"]
        content = fetch_file_content(owner, repo, path)
        if not content:
            # Fallback to name-based summary
            summaries.append(FileSummary(
                path=path,
                summary=f"File: {path.split('/')[-1]} — contents not accessible.",
                type=f["type"]
            ))
            continue

        prompt = f"""You are analyzing a GitHub repository file. Provide a concise 1-2 sentence summary of what this file does and its role in the project.

File: {path}
Content (first 2000 chars):
{content[:2000]}

Summary:"""

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0.3
            )
            summary_text = response.choices[0].message.content.strip()
        except Exception as e:
            summary_text = f"Core file: {path.split('/')[-1]}. Error generating summary: {str(e)[:50]}"

        summaries.append(FileSummary(
            path=path,
            summary=summary_text,
            type=f["type"]
        ))

    return summaries


def answer_question_rule_based(question: str, repo_url: str, repo_data: Dict) -> str:
    """Rule-based answers about the repository."""
    q = question.lower()
    meta = repo_data.get("metadata", {})
    files = repo_data.get("files", [])
    languages = repo_data.get("languages", {})

    repo_name = meta.get("name", "this repository")
    description = meta.get("description", "")
    language = meta.get("language", "")
    stars = meta.get("stargazers_count", 0)
    owner = meta.get("owner", {}).get("login", "")

    top_langs = sorted(languages.keys(), key=lambda k: languages[k], reverse=True)[:3]

    file_paths = [f["path"] for f in files]

    # Purpose / what is it
    if any(word in q for word in ["purpose", "what is", "what does", "about", "description"]):
        if description:
            return f"{repo_name} is a project by {owner}. {description}. It is primarily written in {language or 'multiple languages'}."
        return f"{repo_name} is a GitHub repository by {owner}, written primarily in {language or 'multiple languages'}. Check the README for a full description."

    # Setup / how to run
    if any(word in q for word in ["setup", "install", "run", "start", "how to"]):
        steps = []
        if any("requirements.txt" in p for p in file_paths):
            steps.append("pip install -r requirements.txt")
        if any("package.json" in p for p in file_paths):
            steps.append("npm install")
        if any("Cargo.toml" in p for p in file_paths):
            steps.append("cargo build")
        if any("go.mod" in p for p in file_paths):
            steps.append("go mod download && go run .")
        if not steps:
            steps.append("Check the README for installation instructions")
        return f"To set up {repo_name}: 1) Clone the repo, 2) {', then '.join(steps)}. Check the README for detailed instructions."

    # Architecture
    if any(word in q for word in ["architecture", "structure", "organized", "layout"]):
        dirs = list(set([p.split("/")[0] for p in file_paths if "/" in p]))[:8]
        dir_str = ", ".join(f"`{d}/`" for d in dirs) if dirs else "a flat structure"
        return f"{repo_name} is organized with top-level directories: {dir_str}. The primary language is {language or ', '.join(top_langs) or 'unknown'}."

    # Dependencies
    if any(word in q for word in ["depend", "librar", "framework", "package", "uses"]):
        lang_str = ", ".join(top_langs) if top_langs else language or "unknown"
        config_files = [p for p in file_paths if p.split("/")[-1] in
                        {"package.json", "requirements.txt", "Cargo.toml", "go.mod", "pom.xml"}]
        if config_files:
            return f"{repo_name} uses {lang_str}. Check {config_files[0]} for the full list of dependencies."
        return f"{repo_name} is written in {lang_str}. No standard dependency file was detected at the root level."

    # Tests
    if any(word in q for word in ["test", "testing", "spec"]):
        test_files = [p for p in file_paths if "test" in p.lower() or "spec" in p.lower()]
        if test_files:
            return f"{repo_name} has {len(test_files)} test file(s). Examples: {', '.join(test_files[:3])}."
        return f"No test files were detected in {repo_name}. Check if tests are in a separate directory."

    # Docker / deployment
    if any(word in q for word in ["docker", "deploy", "container", "kubernetes", "k8s"]):
        docker_files = [p for p in file_paths if "docker" in p.lower() or "compose" in p.lower()]
        if docker_files:
            return f"{repo_name} includes Docker configuration: {', '.join(docker_files[:3])}. Use these to containerize and deploy the application."
        return f"No Docker configuration was found in {repo_name}."

    # Stars / popularity
    if any(word in q for word in ["star", "popular", "contributor"]):
        return f"{repo_name} has {stars:,} stars on GitHub and is maintained by {owner}."

    # Language
    if any(word in q for word in ["language", "written in", "tech stack", "technology"]):
        lang_str = ", ".join(top_langs) if top_langs else language or "multiple languages"
        return f"{repo_name} is primarily written in {lang_str}."

    # Default
    return (
        f"Based on analysis of {repo_name}: it's a {language or 'multi-language'} project by {owner} "
        f"with {len(file_paths)} files. "
        f"{'Description: ' + description + '. ' if description else ''}"
        f"For a more detailed answer, please add an OPENAI_API_KEY to your .env file."
    )


def answer_question(repo_url: str, question: str) -> str:
    """Main Q&A function - uses OpenAI if available, else rule-based."""
    owner, repo = parse_github_url(repo_url)

    # Fetch data for context
    metadata = fetch_repo_metadata(owner, repo)
    branch = metadata.get("default_branch", "main")

    try:
        from services.github_service import fetch_file_tree, fetch_repo_languages
        tree = fetch_file_tree(owner, repo, branch)
        languages = fetch_repo_languages(owner, repo)
        files = [item for item in tree if item.get("type") == "blob"]
    except Exception:
        files = []
        languages = {}

    repo_data = {
        "metadata": metadata,
        "files": files,
        "languages": languages,
    }

    openai_key = os.environ.get("OPENAI_API_KEY")

    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)

            # Build context
            file_list = "\n".join([f["path"] for f in files[:50]])
            top_langs = sorted(languages.keys(), key=lambda k: languages[k], reverse=True)[:5]
            context = f"""Repository: {metadata.get('name')} by {metadata.get('owner', {}).get('login', 'unknown')}
Description: {metadata.get('description', 'None')}
Primary Language: {metadata.get('language', 'Unknown')}
Languages Used: {', '.join(top_langs)}
Stars: {metadata.get('stargazers_count', 0)}
Default Branch: {branch}
Total Files: {len(files)}

Key Files (first 50):
{file_list}"""

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert software architect helping developers understand GitHub repositories. Answer questions based on the repository context provided. Be concise and technical."
                    },
                    {
                        "role": "user",
                        "content": f"Repository Context:\n{context}\n\nQuestion: {question}"
                    }
                ],
                max_tokens=300,
                temperature=0.4
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI Q&A error: {e}")
            return answer_question_rule_based(question, repo_url, repo_data)
    else:
        return answer_question_rule_based(question, repo_url, repo_data)
