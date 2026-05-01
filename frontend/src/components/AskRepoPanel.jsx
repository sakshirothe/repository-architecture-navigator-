import { useState } from 'react';
import { MessageSquare, Send, Loader, Sparkles } from 'lucide-react';

const API = 'https://repository-architecture-navigator.onrender.com';

export default function AskRepoPanel({ repoUrl, sampleQuestions = [] }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const ask = async (q) => {
    const text = (q || question).trim();
    if (!text) return;
    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const res = await fetch(`${API}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, question: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Q&A failed');
      setAnswer(data.answer);
      setHistory(h => [...h, { q: text, a: data.answer }]);
      setQuestion('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in-delay-3">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} className="text-[#6ee7b7]" />
        <h3 className="font-display text-sm font-bold text-white">ASK THE REPO</h3>
        <div className="ml-auto flex items-center gap-1 text-xs text-[#475569]">
          <Sparkles size={11} />
          <span>AI-powered Q&amp;A</span>
        </div>
      </div>

      {/* Sample questions */}
      {sampleQuestions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-[#475569] font-mono mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map(q => (
              <button
                key={q}
                onClick={() => ask(q)}
                disabled={loading}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-[#1e1e2e] text-[#94a3b8] hover:text-[#6ee7b7] hover:border-[#6ee7b7]/30 transition-colors disabled:opacity-40 text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mb-4 space-y-3 max-h-60 overflow-y-auto pr-1">
          {history.slice(-4).map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-2">
                <span className="text-xs font-mono text-[#475569] flex-shrink-0 mt-0.5">Q:</span>
                <p className="text-xs text-[#94a3b8]">{item.q}</p>
              </div>
              <div className="flex gap-2 pl-4">
                <span className="text-xs font-mono text-[#6ee7b7] flex-shrink-0 mt-0.5">A:</span>
                <p className="text-xs text-[#e2e8f0] leading-relaxed">{item.a}</p>
              </div>
              <div className="border-t border-[#1e1e2e]" />
            </div>
          ))}
        </div>
      )}

      {/* Current answer */}
      {answer && !history.find(h => h.a === answer) && (
        <div className="mb-4 p-3 rounded-lg bg-[#6ee7b7]/5 border border-[#6ee7b7]/20">
          <p className="text-xs text-[#6ee7b7] font-mono mb-1">Answer:</p>
          <p className="text-sm text-[#e2e8f0] leading-relaxed">{answer}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && ask()}
          placeholder="Ask anything about this repository..."
          disabled={loading}
          className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-sm font-body text-[#e2e8f0] placeholder-[#2a2a3e] outline-none focus:border-[#6ee7b7]/40 transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => ask()}
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 bg-[#6ee7b7] text-[#0a0a0f] rounded-lg hover:bg-[#5dd4a4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}
