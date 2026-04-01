import type { JobFetcher, RawJob, Platform } from '../types';

const JSEARCH_URL = 'https://jsearch.p.rapidapi.com/search';
const DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseWorkMode(title: string, description: string): 'remote' | 'hybrid' | 'onsite' | null {
  const combined = `${title} ${description}`.toLowerCase();
  if (combined.includes('remote')) return 'remote';
  if (combined.includes('hybrid')) return 'hybrid';
  if (combined.includes('onsite') || combined.includes('on-site') || combined.includes('on site')) return 'onsite';
  return null;
}

function parseJobType(type: string | undefined): 'full-time' | 'part-time' | 'contract' | null {
  if (!type) return null;
  const t = type.toLowerCase();
  if (t.includes('full')) return 'full-time';
  if (t.includes('part')) return 'part-time';
  if (t.includes('contract') || t.includes('freelance')) return 'contract';
  return null;
}

export const indeedFetcher: JobFetcher = {
  platform: 'indeed' as Platform,
  enabled: !!process.env.RAPIDAPI_KEY,

  async fetch(queries: string[]): Promise<RawJob[]> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) return [];

    const jobs: RawJob[] = [];

    for (let i = 0; i < queries.length; i++) {
      if (i > 0) await delay(DELAY_MS);

      try {
        const params = new URLSearchParams({
          query: queries[i],
          page: '1',
          num_pages: '1',
          country: 'de',
          date_posted: 'week',
        });

        const response = await fetch(`${JSEARCH_URL}?${params}`, {
          headers: {
            'x-rapidapi-host': 'jsearch.p.rapidapi.com',
            'x-rapidapi-key': apiKey,
          },
        });

        if (!response.ok) {
          console.error(`JSearch error for "${queries[i]}": ${response.status}`);
          continue;
        }

        const data = await response.json();
        const results = data.data || [];

        for (const item of results) {
          jobs.push({
            external_id: item.job_id || `indeed-${Date.now()}-${Math.random()}`,
            platform: 'indeed',
            title: item.job_title || 'Untitled',
            company: item.employer_name || 'Unknown',
            location: [item.job_city, item.job_state, item.job_country]
              .filter(Boolean)
              .join(', ') || null,
            job_url: item.job_apply_link || item.job_google_link || '',
            description: item.job_description?.substring(0, 5000) || null,
            salary_range: item.job_min_salary && item.job_max_salary
              ? `${item.job_min_salary}-${item.job_max_salary} ${item.job_salary_currency || 'EUR'}/${item.job_salary_period || 'year'}`
              : null,
            job_type: parseJobType(item.job_employment_type),
            work_mode: parseWorkMode(item.job_title || '', item.job_description || ''),
            posted_at: item.job_posted_at_datetime_utc || null,
          });
        }
      } catch (error) {
        console.error(`JSearch fetch error for "${queries[i]}":`, error);
      }
    }

    return jobs;
  },
};
