import OverviewCard from './OverviewCard';
import GraphPanel from './GraphPanel';
import HighImpactFiles from './HighImpactFiles';
import OnboardingPath from './OnboardingPath';
import FileExplorer from './FileExplorer';
import AskRepoPanel from './AskRepoPanel';
import { RotateCcw } from 'lucide-react';

export default function Dashboard({ data, repoUrl, onReset }) {
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 py-3 border-b border-[#1e1e2e]">
        <div>
          <p className="text-xs font-mono text-[#475569]">Analyzed repository</p>
          <p className="text-sm font-mono text-[#6ee7b7] truncate max-w-md">{repoUrl}</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1e1e2e] text-xs font-mono text-[#94a3b8] hover:text-[#6ee7b7] hover:border-[#6ee7b7]/30 transition-colors"
        >
          <RotateCcw size={12} />
          New repo
        </button>
      </div>

      {/* Overview full width */}
      <div className="mb-6">
        <OverviewCard data={data.repoOverview} />
      </div>

      {/* Graph full width */}
      <div className="mb-6">
        <GraphPanel nodes={data.graphNodes} edges={data.graphEdges} />
      </div>

      {/* Two-column for High Impact + Onboarding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <HighImpactFiles files={data.highImpactFiles} />
        <OnboardingPath steps={data.onboardingPath} />
      </div>

      {/* File summaries */}
      <div className="mb-6">
        <FileExplorer files={data.filesWithSummaries} />
      </div>

      {/* Q&A */}
      <div>
        <AskRepoPanel repoUrl={repoUrl} sampleQuestions={data.sampleQuestions} />
      </div>
    </div>
  );
}
