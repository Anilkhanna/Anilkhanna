-- Seed default profile config for job fetcher
INSERT IGNORE INTO profile_config (id, target_roles, primary_skills, secondary_skills, negative_keywords, location_prefs, weights, min_score)
VALUES ('default',
  '[ {"role": "Senior Flutter Developer", "priority": "high"}, {"role": "Senior iOS Developer", "priority": "high"}, {"role": "Mobile Lead", "priority": "high"}, {"role": "Senior Full Stack Developer", "priority": "medium"} ]',
  '["Flutter", "Dart", "Swift", "iOS", "React", "Next.js", "TypeScript"]',
  '["Node.js", "Firebase", "Docker", "CI/CD", "GraphQL"]',
  '["intern", "junior", "trainee", "PHP only"]',
  '{"munich_onsite": true, "hybrid_germany": true, "remote": true}',
  '{"primary_skill": 5, "role_match": 20, "title_keyword": 3, "secondary_skill": 2, "location": 10, "bonus_keyword": 3, "seniority": 5, "negative": -15}',
  65
);
