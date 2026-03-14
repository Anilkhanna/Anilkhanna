import type { Metadata } from "next";
import data from "@/data/portfolio.json";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: `Resume | ${data.siteConfig.name}`,
  description: `Professional resume of ${data.siteConfig.name} — ${data.siteConfig.title}`,
};

export default function ResumePage() {
  const { siteConfig, aboutData, careerData, techStack, whatIDo, projectsData, socialLinks, educationData, certifications } = data;

  return (
    <article className="mx-auto max-w-[800px] bg-white px-12 py-16 text-[#1a1a1a] print:px-0 print:py-0">
      {/* Print button */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <a
          href="/"
          className="text-sm text-gray-500 hover:text-gray-800 underline"
        >
          &larr; Back to portfolio
        </a>
        <PrintButton />
      </div>

      {/* Header */}
      <header className="mb-8 border-b-2 border-[#1a1a1a] pb-6">
        <h1 className="text-3xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="mt-1 text-lg text-gray-600">{siteConfig.title}</p>
        {siteConfig.yearsOfExperience && (
          <p className="mt-1 text-sm text-gray-500">{siteConfig.yearsOfExperience} Years of Experience</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
          {siteConfig.email && <span>Email: {siteConfig.email}</span>}
          {siteConfig.phone && <span>Phone: {siteConfig.phone}</span>}
          {siteConfig.location && <span>Location: {siteConfig.location}</span>}
          {siteConfig.website && (
            <a href={siteConfig.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 underline hover:text-gray-900">
              {siteConfig.website}
            </a>
          )}
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 underline hover:text-gray-900"
            >
              {link.name}
            </a>
          ))}
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[3px] text-gray-400">
          Professional Summary
        </h2>
        {aboutData.paragraphs.map((p, i) => (
          <p key={i} className="mb-2 text-[15px] leading-relaxed text-gray-700">
            {p}
          </p>
        ))}
      </section>

      {/* Technical Skills */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[3px] text-gray-400">
          Technical Skills
        </h2>
        {whatIDo.map((section) => (
          <div key={section.title} className="mb-3">
            <span className="text-[15px] font-semibold">{section.title}: </span>
            <ul className="inline">
              {section.skills.map((skill, i) => (
                <li key={skill} className="inline">
                  {skill}{i < section.skills.length - 1 ? ", " : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <span className="text-[15px] font-semibold">All Technologies: </span>
          <ul className="inline">
            {techStack.map((tech, i) => (
              <li key={tech} className="inline text-[15px] text-gray-700">
                {tech}{i < techStack.length - 1 ? ", " : ""}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[3px] text-gray-400">
          Work Experience
        </h2>
        {careerData.map((job, i) => (
          <div key={i} className="mb-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[15px] font-semibold">{job.role}</h3>
              <span className="text-sm text-gray-500">{job.period}</span>
            </div>
            <p className="text-[15px] italic text-gray-600">{job.company}</p>
            <ul className="mt-1 list-disc pl-5">
              <li className="text-[15px] leading-relaxed text-gray-700">
                {job.description}
              </li>
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      {educationData && educationData.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[3px] text-gray-400">
            Education
          </h2>
          {educationData.map((edu, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[15px] font-semibold">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</h3>
                <span className="text-sm text-gray-500">{edu.year}</span>
              </div>
              <p className="text-[15px] italic text-gray-600">{edu.institution}</p>
              {edu.description && (
                <p className="mt-1 text-[15px] text-gray-700">{edu.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[3px] text-gray-400">
            Certifications
          </h2>
          <ul className="list-disc pl-5">
            {certifications.map((cert: string, i: number) => (
              <li key={i} className="text-[15px] text-gray-700 mb-1">{cert}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Projects */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[3px] text-gray-400">
          Projects
        </h2>
        {projectsData.map((project, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[15px] font-semibold">{project.title}</h3>
              <span className="text-sm text-gray-500">{project.category}</span>
            </div>
            <p className="text-[15px] text-gray-700">{project.description}</p>
            <p className="mt-0.5 text-sm text-gray-500">
              Technologies: {project.tools}
            </p>
          </div>
        ))}
      </section>

      {/* Print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; color: #1a1a1a !important; }
              @page { margin: 0.75in; size: A4; }
            }
          `,
        }}
      />
    </article>
  );
}
