'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        setError(true);
        setPassword('');
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#ccd6f6] text-center mb-2">Job Scheduler</h1>
        <p className="text-sm text-[#8892b0] text-center mb-8">Enter password to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`w-full bg-[#112240] border rounded-md px-4 py-3 text-[#ccd6f6] placeholder-[#4a5568] focus:outline-none focus:border-[#64ffda] ${
              error ? 'border-red-500 animate-[shake_0.3s_ease-in-out]' : 'border-[#1d2d50]'
            }`}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-md bg-[#64ffda] text-[#0a0a0a] font-medium hover:bg-[#64ffda]/90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <a href="/" className="block text-center text-sm text-[#8892b0] hover:text-[#64ffda] mt-6">
          ← Back to Portfolio
        </a>
      </div>
    </div>
  );
}
