-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'indeed',
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_url TEXT NOT NULL,
  description TEXT,
  salary_range TEXT,
  job_type TEXT,
  work_mode TEXT,
  match_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  matched_skills TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  posted_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(external_id, platform)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON jobs(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_discovered_at ON jobs(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_platform ON jobs(platform);

-- Cron logs table
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jobs_found INTEGER NOT NULL DEFAULT 0,
  jobs_new INTEGER NOT NULL DEFAULT 0,
  jobs_updated INTEGER NOT NULL DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success'
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_ran_at ON cron_logs(ran_at DESC);

-- Profile config table (single row)
CREATE TABLE IF NOT EXISTS profile_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  target_roles JSONB NOT NULL DEFAULT '[]',
  primary_skills TEXT[] DEFAULT '{}',
  secondary_skills TEXT[] DEFAULT '{}',
  negative_keywords TEXT[] DEFAULT '{}',
  location_prefs JSONB NOT NULL DEFAULT '{}',
  weights JSONB NOT NULL DEFAULT '{}',
  min_score INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profile_config_updated_at
  BEFORE UPDATE ON profile_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default profile config
INSERT INTO profile_config (id, target_roles, primary_skills, secondary_skills, negative_keywords, location_prefs, weights, min_score)
VALUES (
  'default',
  '[
    {"role": "Senior Flutter Developer", "priority": "high"},
    {"role": "Senior iOS Developer", "priority": "high"},
    {"role": "Senior Full Stack Developer", "priority": "high"},
    {"role": "Senior React Developer", "priority": "medium"},
    {"role": "Mobile Lead", "priority": "medium"}
  ]'::jsonb,
  ARRAY['flutter', 'dart', 'ios', 'swift', 'react', 'nextjs', 'typescript', 'javascript', 'dotnet', 'csharp', 'nodejs'],
  ARRAY['objective-c', 'react-native', 'tailwind', 'postgresql', 'mongodb', 'firebase', 'rest', 'graphql', 'docker', 'aws', 'ci-cd', 'github-actions'],
  ARRAY['junior', 'intern', 'internship', 'php', 'wordpress', 'drupal', 'magento', 'trainee', 'werkstudent', 'praktikum'],
  '{"munich_onsite": true, "hybrid_germany": true, "remote": true}'::jsonb,
  '{"primary_skill": 5, "role_match": 20, "title_keyword": 3, "secondary_skill": 2, "location": 10, "bonus_keyword": 2, "seniority": 5, "negative": -15}'::jsonb,
  15
)
ON CONFLICT (id) DO NOTHING;
