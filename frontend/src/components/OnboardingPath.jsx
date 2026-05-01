import { Map, ArrowRight } from 'lucide-react';

export default function OnboardingPath({ steps = [] }) {
  if (!steps.length) return null;
  return (
    <div className="card animate-fade-in-delay-2">
      <div className="flex items-center gap-2 mb-5">
        <Map size={16} className="text-[#818cf8]" />
        <h3 className="font-display text-sm font-bold text-white">ONBOARDING PATH</h3>
        <span className="ml-auto text-xs font-mono text-[#475569]">New contributor guide</span>
      </div>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-[#818cf8]/40 via-[#6ee7b7]/20 to-transparent" />
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 group">
              {/* Step number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#818cf8]/40 bg-[#0a0a0f] flex items-center justify-center z-10 group-hover:border-[#818cf8] transition-colors">
                <span className="text-xs font-display font-bold text-[#818cf8]">{step.step}</span>
              </div>
              <div className="flex-1 pb-1 min-w-0">
                <p className="text-xs font-mono text-[#94a3b8] mb-0.5">{step.action}</p>
                <code className="text-xs font-mono text-[#818cf8] break-all">{step.file}</code>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">{step.why}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
