import { GitBranch, Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#6ee7b7]/10 border border-[#6ee7b7]/30 flex items-center justify-center">
            <GitBranch size={14} className="text-[#6ee7b7]" />
          </div>
          <span className="font-display text-sm font-bold tracking-tight text-white">
            REPO<span className="text-[#6ee7b7]">NAV</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#475569] font-mono">
          <Zap size={11} className="text-[#6ee7b7]" />
          <span>Powered by GitHub API</span>
        </div>
      </div>
    </nav>
  );
}
