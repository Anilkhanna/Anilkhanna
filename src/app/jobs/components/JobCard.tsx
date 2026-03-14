'use client';

import { useState } from 'react';
import type { Job, JobStatus } from '@/lib/jobs/types';

interface JobCardProps {
  job: Job;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-[#64ffda] bg-[#64ffda]/10 border-[#64ffda]/30';
  if (score >= 50) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  if (score >= 30) return 'text-[#8892b0] bg-[#8892b0]/10 border-[#8892b0]/30';
  return 'text-[#4a5568] bg-[#4a5568]/10 border-[#4a5568]/30';
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Strong match';
  if (score >= 50) return 'Good match';
  if (score >= 30) return 'Partial match';
  return 'Weak match';
}

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    new: 'text-[#64ffda] bg-[#64ffda]/10',
    reviewed: 'text-[#8892b0] bg-[#8892b0]/10',
    saved: 'text-yellow-400 bg-yellow-400/10',
    applied: 'text-blue-400 bg-blue-400/10',
    rejected: 'text-[#4a5568] bg-[#4a5568]/10',
    expired: 'text-[#4a5568] bg-[#4a5568]/10',
  };
  return map[status] || '';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const statusFlow: JobStatus[] = ['new', 'reviewed', 'saved', 'applied'];

export function JobCard({ job, isExpanded, onToggle, onStatusChange, onNotesChange }: JobCardProps) {
  const [notes, setNotes] = useState(job.notes || '');

  function handleNotesBlur() {
    if (notes !== (job.notes || '')) {
      onNotesChange(job.id, notes);
    }
  }

  function handleQuickAction(e: React.MouseEvent, status: JobStatus) {
    e.stopPropagation();
    onStatusChange(job.id, status);
  }

  return (
    <div className={`border rounded-lg transition-colors ${isExpanded ? 'border-[#64ffda]/40 bg-[#0a0f1c]' : 'border-[#1d2d50] bg-[#0a0f1c] hover:border-[#233554]'}`}>
      {/* Collapsed header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer group" onClick={onToggle}>
        <div className={`shrink-0 w-12 h-12 rounded-lg border flex flex-col items-center justify-center text-xs font-bold ${scoreColor(job.match_score)}`}>
          {Math.round(job.match_score)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[#ccd6f6] font-medium truncate">{job.title}</h3>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${statusBadgeClass(job.status)}`}>
              {job.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#8892b0]">
            <span>{job.company}</span>
            {job.location && <><span>·</span><span>{job.location}</span></>}
            {job.work_mode && <><span>·</span><span className="capitalize">{job.work_mode}</span></>}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs text-[#4a5568]">{timeAgo(job.discovered_at)}</span>
          <div className="hidden group-hover:flex gap-1">
            {job.status !== 'saved' && (
              <button onClick={(e) => handleQuickAction(e, 'saved')} className="text-xs px-2 py-1 rounded bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20">Save</button>
            )}
            {job.status !== 'rejected' && (
              <button onClick={(e) => handleQuickAction(e, 'rejected')} className="text-xs px-2 py-1 rounded bg-[#4a5568]/10 text-[#4a5568] hover:bg-[#4a5568]/20">Reject</button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-[#1d2d50] p-4 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={scoreColor(job.match_score).split(' ')[0]}>{scoreLabel(job.match_score)}</span>
              <span className="text-[#8892b0]">{Math.round(job.match_score)}%</span>
            </div>
            <div className="h-1.5 bg-[#112240] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${job.match_score >= 70 ? 'bg-[#64ffda]' : job.match_score >= 50 ? 'bg-yellow-400' : 'bg-[#8892b0]'}`} style={{ width: `${job.match_score}%` }} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-[#8892b0]">
            {job.job_type && <span className="px-2 py-1 rounded bg-[#112240]">{job.job_type}</span>}
            {job.salary_range && <span className="px-2 py-1 rounded bg-[#112240]">{job.salary_range}</span>}
            <span className="px-2 py-1 rounded bg-[#2164f3]/10 text-[#2164f3] capitalize">{job.platform}</span>
          </div>

          {job.matched_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.matched_skills.map((skill) => (
                <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-[#64ffda]/10 text-[#64ffda]">{skill}</span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {statusFlow.map((s) => (
              <button key={s} onClick={() => onStatusChange(job.id, s)} className={`text-xs px-3 py-1.5 rounded transition-colors ${job.status === s ? 'bg-[#64ffda] text-[#0a0a0a] font-medium' : 'bg-[#112240] text-[#8892b0] hover:text-[#ccd6f6]'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <button onClick={() => onStatusChange(job.id, 'rejected')} className={`text-xs px-3 py-1.5 rounded transition-colors ${job.status === 'rejected' ? 'bg-red-500/20 text-red-400 font-medium' : 'bg-[#112240] text-[#8892b0] hover:text-red-400'}`}>
              Rejected
            </button>
          </div>

          {job.job_url && (
            <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-[#64ffda] hover:underline">
              Open Job Posting →
            </a>
          )}

          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={handleNotesBlur} placeholder="Add notes..." rows={2} className="w-full bg-[#112240] border border-[#1d2d50] rounded-md px-3 py-2 text-sm text-[#ccd6f6] placeholder-[#4a5568] focus:outline-none focus:border-[#64ffda] resize-none" />

          {job.description && (
            <div className="max-h-60 overflow-y-auto text-sm text-[#8892b0] leading-relaxed whitespace-pre-wrap border-t border-[#1d2d50] pt-4">
              {job.description}
            </div>
          )}

          <div className="text-xs text-[#4a5568] flex justify-between">
            <span>Discovered {timeAgo(job.discovered_at)}</span>
            <span className="capitalize">{job.platform}</span>
          </div>
        </div>
      )}
    </div>
  );
}
