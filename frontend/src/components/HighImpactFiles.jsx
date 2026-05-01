import { Zap, FileCode2 } from 'lucide-react';

const TYPE_BADGE = {
  entry:  'badge-entry',
  config: 'badge-config',
  core:   'badge-core',
  docs:   'badge-docs',
  source: 'badge-source',
  other:  'badge-other',
};

export default function HighImpactFiles({ files = [] }) {
  if (!files.length) return null;
  return (
    <div className="card animate-fade-in-delay-2">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-[#f472b6]" />
        <h3 className="font-display text-sm font-bold text-white">HIGH-IMPACT FILES</h3>
        <span className="ml-auto text-xs font-mono text-[#475569]">{files.length} files</span>
      </div>
      <div className="space-y-3">
        {files.map((file, i) => (
          <div key={file.path} className="flex gap-3 p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] hover:border-[#f472b6]/20 transition-colors group">
            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-[#111118] border border-[#1e1e2e] flex items-center justify-center text-[#475569] group-hover:text-[#f472b6] transition-colors">
              <FileCode2 size={13} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <code className="text-xs font-mono text-[#e2e8f0] truncate">{file.path}</code>
                <span className={`flex-shrink-0 ${TYPE_BADGE[file.type] || 'badge-other'}`}>
                  {file.type}
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{file.summary}</p>
              <p className="text-xs text-[#475569] mt-1 italic">{file.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
