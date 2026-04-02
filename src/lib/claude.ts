import { execFile } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';

export interface TailorAnalysis {
  matchScore: number;
  jobTitle: string;
  company: string;
  suggestedSummary: string;
  skillAnalysis: {
    matched: string[];
    inResumeNotJD: string[];
    inJDNotResume: string[];
  };
  tailoredBullets: Record<string, string[]>;
  skillsReordered: string[];
}

const PORTFOLIO_PATH = path.join(process.cwd(), 'src/data/portfolio.json');

function buildPrompt(portfolioJson: string, jdText: string): string {
  return `You are a resume tailoring expert. Analyze the job description below against the candidate's portfolio data and produce a tailored resume.

IMPORTANT RULES:
- NEVER fabricate experience, skills, or achievements. Only use facts from the portfolio data.
- Rewrite bullet points to emphasize aspects relevant to this JD, but keep them truthful.
- Reorder skills to prioritize what the JD requires.
- Rewrite the professional summary to align with this specific role.

PORTFOLIO DATA:
${portfolioJson}

JOB DESCRIPTION:
${jdText}

Respond with ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "matchScore": <number 0-100>,
  "jobTitle": "<extracted job title>",
  "company": "<extracted company name>",
  "suggestedSummary": "<2-3 sentence summary tailored to this role>",
  "skillAnalysis": {
    "matched": ["<skills in both resume and JD>"],
    "inResumeNotJD": ["<skills in resume but not in JD>"],
    "inJDNotResume": ["<skills JD wants but candidate doesn't have>"]
  },
  "tailoredBullets": {
    "0": ["<rewritten bullets for careerData[0]>"],
    "1": ["<rewritten bullets for careerData[1]>"],
    "2": ["<rewritten bullets for careerData[2]>"],
    "3": ["<rewritten bullets for careerData[3]>"],
    "4": ["<rewritten bullets for careerData[4]>"],
    "5": ["<rewritten bullets for careerData[5]>"],
    "6": ["<rewritten bullets for careerData[6]>"]
  },
  "skillsReordered": ["<all candidate skills reordered by JD relevance>"]
}`;
}

export async function analyzeJD(jdText: string): Promise<TailorAnalysis> {
  const portfolioJson = await readFile(PORTFOLIO_PATH, 'utf-8');
  const prompt = buildPrompt(portfolioJson, jdText);

  return new Promise((resolve, reject) => {
    const child = execFile(
      process.env.CLAUDE_CLI_PATH || '/home/linuxbrew/.linuxbrew/bin/claude',
      ['-p', '--output-format', 'json'],
      {
        maxBuffer: 1024 * 1024 * 5, // 5MB
        timeout: 120_000, // 2 min
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Claude CLI failed: ${error.message}. stderr: ${stderr}`));
          return;
        }

        try {
          // Claude --output-format json wraps response in a JSON envelope
          const envelope = JSON.parse(stdout);
          // The actual text content is in envelope.result or envelope.content
          const textContent = typeof envelope === 'string'
            ? envelope
            : envelope.result ?? envelope.content ?? stdout;

          // Parse the inner JSON from Claude's text response
          const jsonStr = typeof textContent === 'string' ? textContent : JSON.stringify(textContent);
          // Extract JSON from possible markdown code fences
          const cleaned = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const analysis: TailorAnalysis = JSON.parse(cleaned);
          resolve(analysis);
        } catch (parseError) {
          reject(new Error(`Failed to parse Claude response: ${parseError}. Raw: ${stdout.substring(0, 500)}`));
        }
      }
    );

    // Write prompt to stdin
    if (child.stdin) {
      child.stdin.write(prompt);
      child.stdin.end();
    }
  });
}
