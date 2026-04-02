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

function runClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      process.env.CLAUDE_CLI_PATH || '/home/linuxbrew/.linuxbrew/bin/claude',
      ['-p', '--output-format', 'json'],
      {
        maxBuffer: 1024 * 1024 * 5,
        timeout: 120_000,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Claude CLI failed: ${error.message}. stderr: ${stderr}`));
          return;
        }
        try {
          const envelope = JSON.parse(stdout);
          const textContent = envelope.result ?? envelope.content ?? '';
          resolve(textContent);
        } catch (parseError) {
          reject(new Error(`Failed to parse Claude response: ${parseError}. Raw: ${stdout.substring(0, 500)}`));
        }
      }
    );
    if (child.stdin) {
      child.stdin.write(prompt);
      child.stdin.end();
    }
  });
}

export async function generateCoverLetter(jdText: string, jobTitle: string, company: string): Promise<string> {
  const portfolioJson = await readFile(PORTFOLIO_PATH, 'utf-8');

  const prompt = `You are a professional cover letter writer. Write a compelling cover letter for the job below using ONLY facts from the candidate's portfolio data.

RULES:
- Keep it concise: 3-4 paragraphs, under 350 words
- Opening: mention the specific role and company, show genuine interest
- Middle: highlight 2-3 most relevant achievements from the portfolio that match the JD
- Closing: express enthusiasm and availability
- Tone: professional but personable, confident not arrogant
- NEVER fabricate or exaggerate — only use facts from the portfolio
- Do NOT include placeholder addresses or dates — start directly with "Dear Hiring Manager,"

JOB TITLE: ${jobTitle}
COMPANY: ${company}

PORTFOLIO DATA:
${portfolioJson}

JOB DESCRIPTION:
${jdText}

Write the cover letter as plain text (no markdown, no JSON, no code fences):`;

  const result = await runClaude(prompt);
  // Clean up any markdown fences if Claude added them
  return result.replace(/```\w*\n?/g, '').trim();
}

export async function analyzeJD(jdText: string): Promise<TailorAnalysis> {
  const portfolioJson = await readFile(PORTFOLIO_PATH, 'utf-8');
  const prompt = buildPrompt(portfolioJson, jdText);
  const textContent = await runClaude(prompt);

  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`No JSON object found in Claude response. Raw result: ${textContent.substring(0, 500)}`);
  }
  return JSON.parse(jsonMatch[0]) as TailorAnalysis;
}
