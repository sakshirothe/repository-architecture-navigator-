import { useState } from 'react';
import { Search, AlertCircle, Github } from 'lucide-react';
import { validateGitHubUrl } from '../utils/validation';

const EXAMPLES = [
  'https://github.com/tiangolo/fastapi',
  'https://github.com/facebook/react',
  'https://github.com/vercel/next.js',
  'https://github.com/django/django',
];

export default function RepoInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const { valid, error: err } = validateGitHubUrl(url);
    if (!valid) { setError(err); return; }
    setError('');
    onAnalyze(url.trim());
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="max-w-2xl mx-auto px-6 pb-12">
      {/* Input */}
      <div className={`flex items-stretch gap-0 rounded-xl border ${error ? 'border-red-500/40' : 'border-[#1e1e2e]'} bg-[#111118] overflow-hidden transition-colors focus-within:border-[#6ee7b7]/40`}>
        <div className="flex items-center pl-4 text-[#475569]">
          <Github size={16} />
        </div>
        <input
          type="text"
          value={url}
          onChange={e => { setUrl(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          placeholder="https://github.com/owner/repository"
          disabled={loading}
          className="flex-1 bg-transparent px-3 py-4 text-sm font-mono text-[#e2e8f0] placeholder-[#2a2a3e] outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !url.trim()}
          className="px-6 py-4 bg-[#6ee7b7] text-[#0a0a0f] font-display text-sm font-bold tracking-wider hover:bg-[#5dd4a4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Search size={14} />
          {loading ? 'ANALYZING...' : 'ANALYZE'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-xs font-mono">
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      {/* Examples */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#475569] font-mono">Try:</span>
        {EXAMPLES.map(ex => {
          const label = ex.replace('https://github.com/', '');
          return (
            <button
              key={ex}
              onClick={() => { setUrl(ex); setError(''); }}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-md border border-[#1e1e2e] text-[#6ee7b7]/70 hover:text-[#6ee7b7] hover:border-[#6ee7b7]/30 font-mono transition-colors disabled:opacity-40"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
