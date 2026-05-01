import { Star, GitFork, FileCode2, Globe, GitBranch, ExternalLink } from 'lucide-react';

export default function OverviewCard({ data }) {
  if (!data) return null;
  const { name, description, language, stars, forks, default_branch, total_files, top_languages, owner, url } = data;

  const stats = [
    { icon: Star, label: 'Stars', value: stars?.toLocaleString() ?? '0' },
    { icon: GitFork, label: 'Forks', value: forks?.toLocaleString() ?? '0' },
    { icon: FileCode2, label: 'Files', value: total_files?.toLocaleString() ?? '0' },
    { icon: GitBranch, label: 'Branch', value: default_branch ?? 'main' },
  ];

  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#475569]">{owner}/</span>
            <h2 className="font-display text-lg font-bold text-white truncate">{name}</h2>
          </div>
          {description && <p className="text-sm text-[#94a3b8] leading-relaxed line-clamp-2">{description}</p>}
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 p-2 rounded-lg border border-[#1e1e2e] text-[#475569] hover:text-[#6ee7b7] hover:border-[#6ee7b7]/30 transition-colors">
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e]">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={11} className="text-[#475569]" />
              <span className="text-xs text-[#475569] font-mono">{label}</span>
            </div>
            <span className="text-sm font-display font-bold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Languages */}
      {top_languages?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-[#475569] font-mono self-center">Languages:</span>
          {top_languages.map((lang, i) => (
            <span key={lang} className={`badge ${i === 0 ? 'badge-entry' : 'bg-[#1e1e2e] text-[#94a3b8] border border-[#2a2a3e]'}`}>
              {lang}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
