import { Terminal, GitBranch, Network, FileCode2 } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="text-center pt-24 pb-10 px-6 relative">
      {/* Decorative grid bg */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Floating icons */}
      <div className="absolute top-20 left-[12%] text-[#6ee7b7]/20 animate-float hidden md:block">
        <GitBranch size={28} />
      </div>
      <div className="absolute top-32 right-[14%] text-[#818cf8]/20 animate-float hidden md:block" style={{ animationDelay: '2s' }}>
        <Network size={24} />
      </div>
      <div className="absolute top-20 right-[25%] text-[#f472b6]/20 animate-float hidden md:block" style={{ animationDelay: '4s' }}>
        <FileCode2 size={20} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6ee7b7]/20 bg-[#6ee7b7]/5 mb-6">
          <Terminal size={12} className="text-[#6ee7b7]" />
          <span className="text-xs font-mono text-[#6ee7b7] tracking-wider">ARCHITECTURE ANALYSIS ENGINE</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          UNDERSTAND ANY<br />
          <span className="text-[#6ee7b7]">GITHUB REPO</span><br />
          <span className="text-[#475569] text-3xl md:text-4xl">IN SECONDS</span>
        </h1>

        <p className="text-[#94a3b8] text-base md:text-lg font-body max-w-xl mx-auto leading-relaxed">
          Paste a public GitHub URL and get a complete architectural breakdown — file graph, entry points, onboarding path, and smart Q&A.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['Real GitHub Data', 'Dependency Graph', 'Smart Summaries', 'Q&A Panel'].map(f => (
            <span key={f} className="text-xs px-3 py-1 rounded-full bg-[#111118] border border-[#1e1e2e] text-[#94a3b8] font-mono">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
