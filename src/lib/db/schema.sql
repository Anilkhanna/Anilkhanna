-- Portfolio Database Schema (MySQL)
-- Run this against your MySQL database to initialize all tables.

-- Jobs system (migrated from PostgreSQL)

CREATE TABLE IF NOT EXISTS jobs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  external_id   VARCHAR(255) NOT NULL,
  platform      VARCHAR(50) DEFAULT 'indeed',
  title         VARCHAR(500) NOT NULL,
  company       VARCHAR(255),
  location      VARCHAR(255),
  job_url       VARCHAR(1000),
  description   TEXT,
  salary_range  VARCHAR(255),
  job_type      VARCHAR(100),
  work_mode     VARCHAR(50),
  match_score   INT DEFAULT 0,
  matched_skills JSON,
  status        VARCHAR(20) DEFAULT 'new',
  notes         TEXT,
  posted_at     VARCHAR(100),
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_external (external_id, platform)
);

CREATE TABLE IF NOT EXISTS cron_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ran_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  jobs_found    INT DEFAULT 0,
  jobs_new      INT DEFAULT 0,
  jobs_updated  INT DEFAULT 0,
  errors        JSON,
  duration_ms   INT DEFAULT 0,
  status        VARCHAR(20) DEFAULT 'running'
);

CREATE TABLE IF NOT EXISTS profile_config (
  id                VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  target_roles      JSON,
  primary_skills    JSON,
  secondary_skills  JSON,
  negative_keywords JSON,
  location_prefs    JSON,
  weights           JSON,
  min_score         INT DEFAULT 30,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Site analytics

CREATE TABLE IF NOT EXISTS page_views (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  path          VARCHAR(500) NOT NULL,
  referrer      VARCHAR(1000),
  country       VARCHAR(10),
  device        VARCHAR(20),
  browser       VARCHAR(50),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_path (path),
  INDEX idx_created (created_at)
);

-- Resume tailor system

CREATE TABLE IF NOT EXISTS tailored_resumes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  job_title       VARCHAR(255) NOT NULL,
  company         VARCHAR(255),
  jd_text         TEXT NOT NULL,
  jd_url          VARCHAR(500),
  tailored_data   JSON NOT NULL,
  skills_included JSON,
  skills_excluded JSON,
  match_score     INT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
