// Types shared across the job scheduler feature

export type JobStatus = 'new' | 'reviewed' | 'saved' | 'applied' | 'rejected' | 'expired';
export type CronStatus = 'success' | 'partial' | 'failed';
export type Platform = 'indeed';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type JobType = 'full-time' | 'part-time' | 'contract';
export type RolePriority = 'high' | 'medium' | 'low';

export interface Job {
  id: string;
  external_id: string;
  platform: Platform;
  title: string;
  company: string;
  location: string | null;
  job_url: string;
  description: string | null;
  salary_range: string | null;
  job_type: JobType | null;
  work_mode: WorkMode | null;
  match_score: number;
  matched_skills: string[];
  status: JobStatus;
  notes: string | null;
  posted_at: string | null;
  discovered_at: string;
  updated_at: string;
}

export interface RawJob {
  external_id: string;
  platform: Platform;
  title: string;
  company: string;
  location: string | null;
  job_url: string;
  description: string | null;
  salary_range: string | null;
  job_type: JobType | null;
  work_mode: WorkMode | null;
  posted_at: string | null;
}

export interface MatchResult {
  score: number;
  matched_skills: string[];
}

export interface TargetRole {
  role: string;
  priority: RolePriority;
}

export interface LocationPrefs {
  munich_onsite: boolean;
  hybrid_germany: boolean;
  remote: boolean;
}

export interface ScoringWeights {
  primary_skill: number;
  role_match: number;
  title_keyword: number;
  secondary_skill: number;
  location: number;
  bonus_keyword: number;
  seniority: number;
  negative: number;
}

export interface ProfileConfig {
  id: string;
  target_roles: TargetRole[];
  primary_skills: string[];
  secondary_skills: string[];
  negative_keywords: string[];
  location_prefs: LocationPrefs;
  weights: ScoringWeights;
  min_score: number;
  updated_at: string;
}

export interface CronLog {
  id: string;
  ran_at: string;
  jobs_found: number;
  jobs_new: number;
  jobs_updated: number;
  errors: string[];
  duration_ms: number;
  status: CronStatus;
}

export interface JobsListResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StatsResponse {
  stats: {
    total: number;
    new: number;
    saved: number;
    applied: number;
    rejected: number;
  };
  lastRun: CronLog | null;
}

export interface JobFetcher {
  platform: Platform;
  enabled: boolean;
  fetch(queries: string[]): Promise<RawJob[]>;
}

export interface CronResult {
  success: boolean;
  stats: {
    fetched: number;
    matched: number;
    new_jobs: number;
    updated: number;
  };
  errors: string[];
}
