import { useState } from 'react';
import HeroSection from '../components/HeroSection';
import RepoInput from '../components/RepoInput';
import LoadingScreen from '../components/LoadingScreen';
import Dashboard from '../components/Dashboard';
import { AlertTriangle, X } from 'lucide-react';

const API = 'https://repository-architecture-navigator.onrender.com';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError('');
    setData(null);
    setRepoUrl(url);

    try {
      const res = await fetch(`${API}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.detail || `Server error: ${res.status}`);
      }

      setData(json);
    } catch (e) {
      if (e.message.includes('fetch') || e.message.includes('NetworkError') || e.message.includes('Failed to fetch')) {
        setError('Cannot connect to backend. Make sure FastAPI is running: cd backend && uvicorn main:app --reload');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError('');
    setRepoUrl('');
  };

  return (
    <div className="min-h-screen">
      {!data && (
        <>
          <HeroSection />
          <RepoInput onAnalyze={handleAnalyze} loading={loading} />
        </>
      )}

      {error && (
        <div className="max-w-2xl mx-auto px-6 mb-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-red-400 font-bold mb-1">Analysis Failed</p>
              <p className="text-xs text-red-300/80 leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400/60 hover:text-red-400 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {loading && <LoadingScreen repoUrl={repoUrl} />}

      {data && !loading && (
        <Dashboard data={data} repoUrl={repoUrl} onReset={handleReset} />
      )}
    </div>
  );
}
