UPDATE profile_config SET
  negative_keywords = '["intern", "junior", "trainee", "PHP only", "Java only", "Angular only", "SAP", "ABAP", "Salesforce", "embedded", "hardware", "FPGA", "COBOL", "mainframe", "Werkstudent", "Praktikum", "working student", "internship", "entry level", "0-2 years", "1-3 years", "data scientist", "machine learning engineer", "DevOps engineer", "QA engineer", "test engineer", "manual testing"]',
  target_roles = '[{"role": "Senior Flutter Developer", "priority": "high"}, {"role": "Senior iOS Developer", "priority": "high"}, {"role": "Mobile Lead", "priority": "high"}, {"role": "Senior Mobile Developer", "priority": "high"}, {"role": "Senior Full Stack Developer", "priority": "medium"}, {"role": "Lead Mobile Engineer", "priority": "high"}, {"role": "Staff Mobile Engineer", "priority": "high"}]'
WHERE id = 'default';

DELETE FROM jobs WHERE match_score < 65;
