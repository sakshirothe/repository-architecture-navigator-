import { useEffect, useState } from 'react';

const STEPS = [
  'Fetching repository metadata...',
  'Retrieving recursive file tree...',
  'Identifying entry points & config files...',
  'Building dependency graph...',
  'Generating architecture insights...',
  'Preparing onboarding path...',
];

export default function LoadingScreen({ repoUrl }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const stepTimer = setInterval(() => setStepIdx(i => Math.min(i + 1, STEPS.length - 1)), 1800);
    const dotTimer = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => { clearInterval(stepTimer); clearInterval(dotTimer); };
  }, []);

  const repoName = repoUrl?.split('github.com/').pop() || repoUrl;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20">
      {/* Animated ring */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-[#1e1e2e]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6ee7b7] animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#818cf8] animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        <div className="absolute inset-4 rounded-full bg-[#6ee7b7]/10 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#6ee7b7] animate-pulse" />
        </div>
      </div>

      {/* Repo name */}
      <p className="font-mono text-xs text-[#475569] mb-2">Analyzing</p>
      <p className="font-display text-base font-bold text-[#6ee7b7] mb-8 text-center">{repoName}</p>

      {/* Step list */}
      <div className="w-full max-w-sm space-y-2">
        {STEPS.map((step, i) => (
          <div key={step} className={`flex items-center gap-3 text-xs font-mono transition-all duration-500 ${i < stepIdx ? 'text-[#475569]' : i === stepIdx ? 'text-[#6ee7b7]' : 'text-[#1e1e2e]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i < stepIdx ? 'bg-[#475569]' : i === stepIdx ? 'bg-[#6ee7b7] shadow-[0_0_6px_#6ee7b7]' : 'bg-[#1e1e2e]'}`} />
            {step}{i === stepIdx ? dots : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
