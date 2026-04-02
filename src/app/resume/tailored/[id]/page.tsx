import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { PrintButton } from '../../PrintButton';

interface TailoredData {
  summary: string;
  skills: string[];
  techCategories: { label: string; items: string[] }[];
  career: {
    role: string;
    company: string;
    period: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: string;
  }[];
  siteConfig: {
    name: string;
    title: string;
    yearsOfExperience: string;
    location: string;
    phone: string;
    email: string;
    website: string;
    linkedin: string;
    github: string;
  };
}

export default async function TailoredResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM tailored_resumes WHERE id = ?',
    [id]
  );

  if (rows.length === 0) notFound();

  const record = rows[0];
  const data: TailoredData = typeof record.tailored_data === 'string'
    ? JSON.parse(record.tailored_data)
    : record.tailored_data;

  return (
    <article className="mx-auto max-w-[800px] bg-white px-10 py-12 text-[#111] print:px-0 print:py-0">
      {/* Navigation — hidden in print */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <a
          href="/admin-panel-9x7k"
          className="text-sm text-gray-500 underline hover:text-gray-800"
        >
          &larr; Back to admin
        </a>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
            Tailored for: {record.job_title}{record.company ? ` @ ${record.company}` : ''}
          </span>
          <PrintButton />
        </div>
      </div>

      {/* ── HEADER ── */}
      <header className="mb-5 border-b border-gray-300 pb-4">
        <h1 className="text-[26px] font-bold tracking-tight">
          {data.siteConfig.name}
        </h1>
        <p className="mt-0.5 text-[15px] font-medium text-gray-700">
          {data.siteConfig.title} | {data.siteConfig.yearsOfExperience} Years of Experience
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-gray-600">
          {data.siteConfig.location && <span>{data.siteConfig.location}</span>}
          {data.siteConfig.phone && <span>{data.siteConfig.phone}</span>}
          {data.siteConfig.email && <span>{data.siteConfig.email}</span>}
          {data.siteConfig.website && <span>{data.siteConfig.website}</span>}
          {data.siteConfig.linkedin && <span>{data.siteConfig.linkedin}</span>}
          {data.siteConfig.github && <span>{data.siteConfig.github}</span>}
        </p>
      </header>

      {/* ── PROFESSIONAL SUMMARY ── */}
      <section className="mb-5">
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
          Professional Summary
        </h2>
        <p className="text-[13.5px] leading-[1.55] text-gray-700">
          {data.summary}
        </p>
      </section>

      {/* ── CORE COMPETENCIES ── */}
      <section className="mb-5">
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
          Core Competencies
        </h2>
        <div className="text-[13px] leading-[1.6] text-gray-700">
          {data.techCategories.map((cat) => (
            <p key={cat.label} className="mb-0.5">
              <span className="font-semibold">{cat.label}:</span>{' '}
              {cat.items.join(' · ')}
            </p>
          ))}
        </div>
      </section>

      {/* ── PROFESSIONAL EXPERIENCE ── */}
      <section className="mb-5">
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
          Professional Experience
        </h2>
        {data.career.map((job, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[14px] font-bold">{job.role}</h3>
              <span className="shrink-0 text-[12.5px] text-gray-500">{job.period}</span>
            </div>
            <p className="text-[13px] text-gray-600">{job.company}</p>
            <ul className="mt-1 list-disc pl-5 space-y-0.5">
              {job.bullets.map((bullet, j) => (
                <li key={j} className="text-[13px] leading-[1.5] text-gray-700">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ── EDUCATION ── */}
      {data.education && data.education.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
            Education
          </h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[13.5px] font-semibold">
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                </h3>
                <span className="text-[12.5px] text-gray-500">{edu.year}</span>
              </div>
              <p className="text-[13px] text-gray-600">{edu.institution}</p>
            </div>
          ))}
        </section>
      )}

      {/* Print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; color: #111 !important; -webkit-print-color-adjust: exact; }
              @page { margin: 0.5in 0.6in; size: A4; }
              a { color: #111 !important; text-decoration: none !important; }
              article { padding: 0 !important; max-width: none !important; }
            }
          `,
        }}
      />
    </article>
  );
}
