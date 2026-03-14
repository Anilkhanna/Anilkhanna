import type { RawJob, MatchResult, ProfileConfig } from './types';

const BONUS_KEYWORDS = ['fintech', 'mobile', 'startup', 'scale-up', 'greenfield', 'product'];

export function matchJob(job: RawJob, config: ProfileConfig): MatchResult {
  const title = job.title.toLowerCase();
  const description = (job.description || '').toLowerCase();
  const location = (job.location || '').toLowerCase();
  const combined = `${title} ${description}`;
  const matchedSkills: string[] = [];
  const w = config.weights;
  let score = 0;

  // 1. Primary skills (5 pts each, cap 40)
  let primaryPoints = 0;
  for (const skill of config.primary_skills) {
    const normalizedSkill = skill.toLowerCase();
    if (combined.includes(normalizedSkill)) {
      primaryPoints += w.primary_skill;
      matchedSkills.push(skill);
    }
  }
  score += Math.min(primaryPoints, 40);

  // 2. Role title match (20 pts for high priority exact match)
  for (const role of config.target_roles) {
    const normalizedRole = role.role.toLowerCase();
    if (title.includes(normalizedRole)) {
      score += role.priority === 'high' ? w.role_match : Math.floor(w.role_match / 2);
      break;
    }
  }

  // 3. Title keywords (3 pts each, cap 10)
  const titleKeywords = new Set<string>();
  for (const role of config.target_roles) {
    for (const word of role.role.toLowerCase().split(/\s+/)) {
      if (word.length > 3) titleKeywords.add(word);
    }
  }
  let titlePoints = 0;
  for (const keyword of titleKeywords) {
    if (title.includes(keyword)) {
      titlePoints += w.title_keyword;
    }
  }
  score += Math.min(titlePoints, 10);

  // 4. Secondary skills (2 pts each, cap 15)
  let secondaryPoints = 0;
  for (const skill of config.secondary_skills) {
    if (combined.includes(skill.toLowerCase())) {
      secondaryPoints += w.secondary_skill;
      if (!matchedSkills.includes(skill)) matchedSkills.push(skill);
    }
  }
  score += Math.min(secondaryPoints, 15);

  // 5. Location match (up to 10 pts)
  const workMode = job.work_mode?.toLowerCase() || '';
  if (workMode === 'remote' && config.location_prefs.remote) {
    score += w.location;
  } else if (workMode === 'hybrid' && config.location_prefs.hybrid_germany) {
    score += Math.floor(w.location * 0.7);
  } else if (location.includes('munich') || location.includes('münchen')) {
    if (config.location_prefs.munich_onsite) score += w.location;
  }

  // 6. Bonus keywords (2 pts each, cap 10)
  let bonusPoints = 0;
  for (const keyword of BONUS_KEYWORDS) {
    if (combined.includes(keyword)) {
      bonusPoints += w.bonus_keyword;
    }
  }
  score += Math.min(bonusPoints, 10);

  // 7. Seniority match (5 pts)
  if (/senior|lead|principal|staff|10\+\s*years/i.test(combined)) {
    score += w.seniority;
  }

  // 8. Negative keywords (-15 each)
  for (const keyword of config.negative_keywords) {
    if (combined.includes(keyword.toLowerCase())) {
      score += w.negative; // negative value
    }
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  return { score, matched_skills: matchedSkills };
}
