import { Github, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] mt-16 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-[#6ee7b7]" />
          <span className="font-display text-xs text-[#475569]">
            REPO<span className="text-[#6ee7b7]">NAV</span> · Repository Architecture Navigator
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#475569] font-mono">
          <span>Powered by GitHub API</span>
          <span className="text-[#1e1e2e]">|</span>
          <span>FastAPI + React</span>
          <span className="text-[#1e1e2e]">|</span>
          <span className="text-[#6ee7b7]">No fake data. Real repos only.</span>
        </div>
      </div>
    </footer>
  );
}
