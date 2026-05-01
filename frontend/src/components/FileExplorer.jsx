import { useState } from 'react';
import { FolderOpen, FileText, ChevronDown, ChevronRight } from 'lucide-react';

const TYPE_BADGE = {
  entry:  'badge-entry',
  config: 'badge-config',
  core:   'badge-core',
  docs:   'badge-docs',
  source: 'badge-source',
  other:  'badge-other',
};

export default function FileExplorer({ files = [] }) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  if (!files.length) return null;
  const visible = showAll ? files : files.slice(0, 8);

  return (
    <div className="card animate-fade-in-delay-3">
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-2 w-full text-left mb-1"
      >
        {expanded ? <ChevronDown size={14} className="text-[#475569]" /> : <ChevronRight size={14} className="text-[#475569]" />}
        <FolderOpen size={15} className="text-[#fbbf24]" />
        <h3 className="font-display text-sm font-bold text-white">FILE SUMMARIES</h3>
        <span className="ml-auto text-xs font-mono text-[#475569]">{files.length} analyzed</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {visible.map(file => (
            <div key={file.path} className="flex gap-3 p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] hover:border-[#fbbf24]/20 transition-colors">
              <FileText size={13} className="text-[#475569] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <code className="text-xs font-mono text-[#e2e8f0] truncate">{file.path}</code>
                  <span className={`flex-shrink-0 ${TYPE_BADGE[file.type] || 'badge-other'}`}>{file.type}</span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">{file.summary}</p>
              </div>
            </div>
          ))}

          {files.length > 8 && (
            <button
              onClick={() => setShowAll(s => !s)}
              className="w-full text-center text-xs font-mono text-[#6ee7b7] py-2 hover:text-[#5dd4a4] transition-colors"
            >
              {showAll ? '↑ Show less' : `↓ Show ${files.length - 8} more files`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
