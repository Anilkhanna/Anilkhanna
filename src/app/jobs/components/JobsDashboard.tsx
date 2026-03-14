'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Job, JobStatus, StatsResponse } from '@/lib/jobs/types';
import { StatsBar } from './StatsBar';
import { FilterBar } from './FilterBar';
import { JobCard } from './JobCard';
import { SettingsPanel } from './SettingsPanel';
import { triggerFetchNow, logout as logoutAction } from '../actions';

export function JobsDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('match_score');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = useCallback(async () => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', '20');

    try {
      const res = await fetch(`/api/jobs?${params}`);
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      // ignore
    }
  }, [status, search, sort, page, router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchJobs(), fetchStats()]).then(() => setLoading(false));
  }, [fetchJobs, fetchStats]);

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDebounce), 300);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  async function handleFetchNow() {
    setFetching(true);
    await triggerFetchNow();
    await Promise.all([fetchJobs(), fetchStats()]);
    setFetching(false);
  }

  async function handleStatusChange(id: string, newStatus: JobStatus) {
    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    await Promise.all([fetchJobs(), fetchStats()]);
  }

  async function handleNotesChange(id: string, notes: string) {
    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes }),
    });
  }

  async function handleLogout() {
    await logoutAction();
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-[#8892b0]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1d2d50]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="text-[#8892b0] hover:text-[#64ffda] text-sm">←</a>
          <h1 className="text-lg font-medium text-[#ccd6f6] flex-1">Job Scheduler</h1>

          <button
            onClick={handleFetchNow}
            disabled={fetching}
            className="text-xs px-3 py-1.5 rounded bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20 disabled:opacity-50"
          >
            {fetching ? 'Fetching...' : 'Fetch Now'}
          </button>

          {stats?.lastRun && (
            <span className="text-xs text-[#4a5568] hidden sm:inline">
              Last run: {new Date(stats.lastRun.ran_at).toLocaleString()}
            </span>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="text-[#8892b0] hover:text-[#ccd6f6] text-sm"
            title="Settings"
          >
            ⚙
          </button>

          <button
            onClick={handleLogout}
            className="text-xs text-[#8892b0] hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {stats && <StatsBar stats={stats.stats} />}

        <FilterBar
          search={searchDebounce}
          status={status}
          sort={sort}
          onSearchChange={setSearchDebounce}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          onSortChange={(v) => { setSort(v); setPage(1); }}
        />

        {/* Job list */}
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-[#8892b0]">
              {search || status !== 'all' ? 'No jobs match your filters.' : 'No jobs yet. Click "Fetch Now" to get started.'}
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isExpanded={expandedId === job.id}
                onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm ${
                  p === page
                    ? 'bg-[#64ffda] text-[#0a0a0a] font-medium'
                    : 'bg-[#112240] text-[#8892b0] hover:text-[#ccd6f6]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings modal */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
