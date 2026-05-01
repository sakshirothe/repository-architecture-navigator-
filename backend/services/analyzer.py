import os
from typing import List, Dict, Any, Optional, Tuple
from services.github_service import (
    fetch_repo_metadata,
    fetch_file_tree,
    fetch_file_content,
    fetch_repo_languages,
    parse_github_url,
)
from schemas import (
    RepoOverview, GraphNode, GraphEdge, HighImpactFile,
    OnboardingStep, FileSummary, AnalyzeResponse
)

# Known important file patterns
ENTRY_POINT_FILES = {
    "main.py", "app.py", "server.py", "run.py", "wsgi.py", "asgi.py",
    "index.js", "server.js", "app.js",
    "index.ts", "server.ts", "app.ts",
    "main.ts", "main.jsx", "App.jsx", "App.tsx",
    "index.jsx", "index.tsx",
    "manage.py",  # Django
    "Program.cs",  # .NET
    "main.go", "main.rb", "main.java",
}

CONFIG_FILES = {
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "requirements.txt", "Pipfile", "pyproject.toml", "setup.py", "setup.cfg",
    "Cargo.toml", "go.mod", "pom.xml", "build.gradle",
    "docker-compose.yml", "docker-compose.yaml", "Dockerfile",
    ".env.example", ".env.sample",
    "vite.config.js", "vite.config.ts", "webpack.config.js",
    "tsconfig.json", "jsconfig.json",
    "next.config.js", "next.config.ts", "nuxt.config.ts",
    ".eslintrc.js", ".eslintrc.json", "babel.config.js",
    "tailwind.config.js", "tailwind.config.ts",
    "Makefile", "CMakeLists.txt",
}

IMPORTANT_DOCS = {"README.md", "README.rst", "README.txt", "CONTRIBUTING.md", "ARCHITECTURE.md"}

CORE_DIR_PATTERNS = ["src", "lib", "core", "api", "services", "controllers", "models", "routes", "app"]


def classify_file(path: str) -> str:
    filename = path.split("/")[-1]
    if filename in ENTRY_POINT_FILES:
        return "entry"
    if filename in CONFIG_FILES:
        return "config"
    if filename in IMPORTANT_DOCS:
        return "docs"

    # Heuristic for core files
    parts = path.lower().split("/")
    for part in parts[:-1]:
        if part in CORE_DIR_PATTERNS:
            return "core"

    ext = filename.rsplit(".", 1)[-1] if "." in filename else ""
    if ext in ["py", "js", "ts", "jsx", "tsx", "go", "rs", "java", "rb", "cs"]:
        return "source"

    return "other"


def get_file_summary_rule_based(path: str, file_type: str) -> str:
    filename = path.split("/")[-1]
    ext = filename.rsplit(".", 1)[-1] if "." in filename else ""

    summaries = {
        "main.py": "Application entry point. Starts the server and initializes the app.",
        "app.py": "Core application file. Sets up routes, middleware, and app configuration.",
        "server.py": "Server setup. Configures and starts the HTTP server.",
        "manage.py": "Django management utility for running commands, migrations, and the dev server.",
        "index.js": "Main JavaScript entry point. Bootstraps the application.",
        "App.jsx": "Root React component. Renders the component tree and routing.",
        "App.tsx": "Root React component with TypeScript. Manages routing and global state.",
        "main.jsx": "React application entry. Mounts the root component to the DOM.",
        "main.tsx": "TypeScript React entry. Configures and mounts the app.",
        "package.json": "Node.js project manifest. Lists dependencies, scripts, and metadata.",
        "requirements.txt": "Python dependencies. All packages listed here must be installed.",
        "pyproject.toml": "Modern Python project config with dependencies and build settings.",
        "Cargo.toml": "Rust package manifest with dependencies and crate metadata.",
        "go.mod": "Go module definition. Declares module path and dependency versions.",
        "Dockerfile": "Container build instructions. Defines the Docker image for deployment.",
        "docker-compose.yml": "Multi-service container orchestration. Defines how services connect.",
        "README.md": "Project documentation. Start here to understand purpose and setup.",
        "tsconfig.json": "TypeScript compiler configuration. Defines type-checking rules.",
        "vite.config.js": "Vite bundler configuration for dev server and build optimization.",
        "next.config.js": "Next.js framework configuration for SSR, routing, and build.",
        "tailwind.config.js": "Tailwind CSS configuration with custom theme and plugins.",
    }

    if filename in summaries:
        return summaries[filename]

    # Generic by type
    type_summaries = {
        "entry": f"Entry point file ({filename}). Initializes and starts the application.",
        "config": f"Configuration file ({filename}). Defines settings and dependencies.",
        "docs": f"Documentation file ({filename}). Explains usage, contribution, or architecture.",
        "core": f"Core module ({filename}). Contains business logic or primary functionality.",
        "source": f"Source file ({filename}). Implements application features and logic.",
    }

    return type_summaries.get(file_type, f"File: {filename}. Part of the repository.")


def build_graph(important_files: List[Dict]) -> Tuple[List[GraphNode], List[GraphEdge]]:
    nodes = []
    edges = []
    seen_ids = set()

    for f in important_files[:20]:  # Cap at 20 nodes for clarity
        path = f["path"]
        filename = path.split("/")[-1]
        node_id = path.replace("/", "_").replace(".", "_")

        if node_id in seen_ids:
            continue
        seen_ids.add(node_id)

        nodes.append(GraphNode(
            id=node_id,
            label=filename,
            type=f["type"],
            path=path
        ))

    # Build edges based on logical groupings
    # README → entry point
    readme_node = next((n for n in nodes if n.label.upper().startswith("README")), None)
    entry_nodes = [n for n in nodes if n.type == "entry"]
    config_nodes = [n for n in nodes if n.type == "config"]
    core_nodes = [n for n in nodes if n.type == "core"]

    if readme_node:
        for en in entry_nodes[:2]:
            edges.append(GraphEdge(source=readme_node.id, target=en.id, label="leads to"))

    for cn in config_nodes[:3]:
        for en in entry_nodes[:2]:
            edges.append(GraphEdge(source=cn.id, target=en.id, label="configures"))

    for en in entry_nodes[:2]:
        for core in core_nodes[:4]:
            edges.append(GraphEdge(source=en.id, target=core.id, label="imports"))

    return nodes, edges


def build_onboarding_path(important_files: List[Dict], repo_name: str) -> List[OnboardingStep]:
    steps = []
    step_num = 1

    # Step 1: README
    readme = next((f for f in important_files if f["path"].upper().endswith("README.MD")), None)
    if readme:
        steps.append(OnboardingStep(
            step=step_num,
            file=readme["path"],
            action="Read the README",
            why="Understand what the project does, how to install it, and how to run it."
        ))
        step_num += 1

    # Step 2: Config files (package.json / requirements.txt / etc)
    configs = [f for f in important_files if f["type"] == "config"]
    for cf in configs[:2]:
        steps.append(OnboardingStep(
            step=step_num,
            file=cf["path"],
            action=f"Review {cf['path'].split('/')[-1]}",
            why="Understand the project's dependencies, scripts, and technology choices."
        ))
        step_num += 1

    # Step 3: Entry point
    entries = [f for f in important_files if f["type"] == "entry"]
    for ef in entries[:1]:
        steps.append(OnboardingStep(
            step=step_num,
            file=ef["path"],
            action=f"Open {ef['path'].split('/')[-1]}",
            why="This is where the application starts. Trace the initialization flow from here."
        ))
        step_num += 1

    # Step 4: Core files
    cores = [f for f in important_files if f["type"] == "core"]
    for cf in cores[:3]:
        steps.append(OnboardingStep(
            step=step_num,
            file=cf["path"],
            action=f"Explore {cf['path'].split('/')[-1]}",
            why="Core business logic lives here. Understanding this file reveals how the app works internally."
        ))
        step_num += 1

    return steps


def generate_sample_questions(repo_name: str, lang: Optional[str], files: List[Dict]) -> List[str]:
    questions = [
        f"What is the main purpose of {repo_name}?",
        "How do I set up and run this project locally?",
        "What are the key dependencies used?",
        "What is the overall architecture of this project?",
    ]

    if any(f["path"].endswith(".py") for f in files):
        questions.append("What Python frameworks or libraries does this project use?")
    if any(f["path"].endswith((".js", ".jsx", ".ts", ".tsx")) for f in files):
        questions.append("How is the frontend structured?")
    if any("test" in f["path"].lower() for f in files):
        questions.append("How are tests organized and run?")
    if any("docker" in f["path"].lower() for f in files):
        questions.append("How is the project containerized?")

    return questions[:6]


def analyze_repository(repo_url: str) -> AnalyzeResponse:
    owner, repo = parse_github_url(repo_url)

    # Fetch metadata
    metadata = fetch_repo_metadata(owner, repo)
    branch = metadata.get("default_branch", "main")

    # Fetch file tree
    tree = fetch_file_tree(owner, repo, branch)

    # Fetch languages
    languages = fetch_repo_languages(owner, repo)
    top_languages = sorted(languages.keys(), key=lambda k: languages[k], reverse=True)[:5]

    # Filter to blob files only
    all_files = [item for item in tree if item.get("type") == "blob"]
    total_files = len(all_files)

    # Score and identify important files
    important_files = []
    for f in all_files:
        path = f["path"]
        filename = path.split("/")[-1]
        file_type = classify_file(path)

        # Score importance
        score = 0
        if filename in ENTRY_POINT_FILES:
            score += 10
        if filename in CONFIG_FILES:
            score += 8
        if filename in IMPORTANT_DOCS:
            score += 9
        if file_type == "core":
            score += 5
        if file_type == "source":
            score += 2
        if path.count("/") <= 2:  # Prefer shallower files
            score += 3

        if score > 0:
            important_files.append({
                "path": path,
                "filename": filename,
                "type": file_type,
                "score": score
            })

    # Sort by score
    important_files.sort(key=lambda x: x["score"], reverse=True)

    # Try OpenAI summaries if available
    use_openai = bool(os.environ.get("OPENAI_API_KEY"))
    file_summaries_data = []

    if use_openai:
        try:
            from services.qa import generate_file_summaries_openai
            summaries = generate_file_summaries_openai(
                owner, repo, important_files[:15], branch
            )
            file_summaries_data = summaries
        except Exception as e:
            print(f"OpenAI error, falling back: {e}")
            use_openai = False

    if not use_openai:
        for f in important_files[:15]:
            file_summaries_data.append(FileSummary(
                path=f["path"],
                summary=get_file_summary_rule_based(f["path"], f["type"]),
                type=f["type"]
            ))

    # Build graph
    graph_nodes, graph_edges = build_graph(important_files)

    # High-impact files
    high_impact = []
    for f in important_files[:8]:
        reason_map = {
            "entry": "Application entry point — execution starts here",
            "config": "Configuration — defines project dependencies and settings",
            "docs": "Documentation — explains project purpose and setup",
            "core": "Core module — contains primary business logic",
            "source": "Source file — implements key functionality",
        }
        high_impact.append(HighImpactFile(
            path=f["path"],
            reason=reason_map.get(f["type"], "Important project file"),
            type=f["type"],
            summary=get_file_summary_rule_based(f["path"], f["type"])
        ))

    # Onboarding path
    onboarding = build_onboarding_path(important_files, repo)

    # Sample questions
    sample_questions = generate_sample_questions(repo, metadata.get("language"), all_files)

    # Repo overview
    repo_overview = RepoOverview(
        name=metadata.get("name", repo),
        description=metadata.get("description"),
        language=metadata.get("language"),
        stars=metadata.get("stargazers_count", 0),
        forks=metadata.get("forks_count", 0),
        default_branch=branch,
        total_files=total_files,
        top_languages=top_languages,
        owner=owner,
        url=metadata.get("html_url", repo_url)
    )

    return AnalyzeResponse(
        repoOverview=repo_overview,
        graphNodes=graph_nodes,
        graphEdges=graph_edges,
        highImpactFiles=high_impact,
        onboardingPath=onboarding,
        filesWithSummaries=file_summaries_data,
        sampleQuestions=sample_questions
    )
