import type { Metadata } from "next";
import data from "@/data/portfolio.json";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: `Resume | ${data.siteConfig.name}`,
  description: `Professional resume of ${data.siteConfig.name} — ${data.siteConfig.title}`,
};

interface CareerEntry {
  role: string;
  company: string;
  period: string;
  description: string;
  bullets?: string[];
}

export default function ResumePage() {
  const {
    siteConfig,
    aboutData,
    careerData,
    techCategories,
    socialLinks,
    educationData,
    certifications,
  } = data;

  const career = careerData as CareerEntry[];

  return (
    <article className="mx-auto max-w-[800px] bg-white px-10 py-12 text-[#111] print:px-0 print:py-0">
      {/* Navigation — hidden in print */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <a
          href="/"
          className="text-sm text-gray-500 underline hover:text-gray-800"
        >
          &larr; Back to portfolio
        </a>
        <PrintButton />
      </div>

      {/* ── HEADER ── */}
      <header className="mb-5 border-b border-gray-300 pb-4">
        <h1 className="text-[26px] font-bold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="mt-0.5 text-[15px] font-medium text-gray-700">
          {siteConfig.title} | {siteConfig.yearsOfExperience} Years of
          Experience
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-gray-600">
          {siteConfig.location && <span>{siteConfig.location}</span>}
          {siteConfig.phone && <span>{siteConfig.phone}</span>}
          {siteConfig.email && <span>{siteConfig.email}</span>}
          {siteConfig.website && <span>{siteConfig.website}</span>}
          {socialLinks
            .filter((l) => l.name === "LinkedIn")
            .map((l) => (
              <span key={l.name}>{l.url}</span>
            ))}
          {socialLinks
            .filter((l) => l.name === "GitHub")
            .map((l) => (
              <span key={l.name}>{l.url}</span>
            ))}
        </p>
      </header>

      {/* ── PROFESSIONAL SUMMARY ── */}
      <section className="mb-5">
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
          Professional Summary
        </h2>
        <p className="text-[13.5px] leading-[1.55] text-gray-700">
          {aboutData.paragraphs[0]} {aboutData.paragraphs[1]}
        </p>
      </section>

      {/* ── CORE COMPETENCIES (keyword block for ATS) ── */}
      <section className="mb-5">
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
          Core Competencies
        </h2>
        <div className="text-[13px] leading-[1.6] text-gray-700">
          {techCategories.map((cat) => (
            <p key={cat.label} className="mb-0.5">
              <span className="font-semibold">{cat.label}:</span>{" "}
              {cat.items.join(" · ")}
            </p>
          ))}
        </div>
      </section>

      {/* ── WORK EXPERIENCE ── */}
      <section className="mb-5">
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
          Professional Experience
        </h2>
        {career.map((job, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[14px] font-bold">{job.role}</h3>
              <span className="shrink-0 text-[12.5px] text-gray-500">
                {job.period}
              </span>
            </div>
            <p className="text-[13px] text-gray-600">{job.company}</p>
            <ul className="mt-1 list-disc pl-5 space-y-0.5">
              {(job.bullets ?? [job.description]).map((bullet, j) => (
                <li
                  key={j}
                  className="text-[13px] leading-[1.5] text-gray-700"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ── EDUCATION ── */}
      {educationData && educationData.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
            Education
          </h2>
          {educationData.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[13.5px] font-semibold">
                  {edu.degree}
                  {edu.field ? ` in ${edu.field}` : ""}
                </h3>
                <span className="text-[12.5px] text-gray-500">{edu.year}</span>
              </div>
              <p className="text-[13px] text-gray-600">{edu.institution}</p>
            </div>
          ))}
        </section>
      )}

      {/* ── CERTIFICATIONS ── */}
      {certifications && certifications.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
            Certifications
          </h2>
          <ul className="list-disc pl-5">
            {certifications.map((cert: string, i: number) => (
              <li key={i} className="text-[13px] text-gray-700">
                {cert}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Print styles — ATS-friendly: single column, standard fonts */}
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
