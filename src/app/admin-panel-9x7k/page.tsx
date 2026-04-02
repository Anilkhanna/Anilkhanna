"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { FiPlus, FiTrash2, FiSun, FiMoon } from "react-icons/fi";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SiteConfig {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  altTitle: string;
  greeting: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  yearsOfExperience: string;
  resumeUrl: string;
}
interface Availability {
  isAvailable: boolean;
  roles: string;
  domains: string;
  location: string;
  freelance: boolean;
}
interface NavLink { label: string; href: string; type: "anchor" | "page"; }
interface SocialLink { name: string; url: string; icon: string; }
interface AboutData { heading: string; paragraphs: string[]; }
interface WhatIDoItem { title: string; description: string; skills: string[]; }
interface CareerItem { role: string; company: string; period: string; description: string; bullets?: string[]; }
interface ProjectItem {
  number: string; title: string; category: string; tools: string;
  description: string; image: string | null; liveUrl: string; githubUrl: string;
}
interface EducationItem { degree: string; field: string; institution: string; year: string; description: string; }
interface SectionHeading { label: string; title: string; }
interface SectionHeadings {
  about: SectionHeading;
  whatIDo: SectionHeading;
  career: SectionHeading;
  projects: SectionHeading;
  techStack: SectionHeading;
  contact: SectionHeading;
}
interface TechCategory { label: string; items: string[]; }
interface PortfolioData {
  siteConfig: SiteConfig;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
  sectionHeadings: SectionHeadings;
  aboutData: AboutData;
  trendingSkills: string[];
  techStack: string[];
  techCategories: TechCategory[];
  whatIDo: WhatIDoItem[];
  careerData: CareerItem[];
  projectsData: ProjectItem[];
  educationData: EducationItem[];
  certifications: string[];
  availability: Availability;
  testimonials: unknown[];
  caseStudies: unknown[];
  services: unknown;
}

const ICON_OPTIONS = ["FaGithub", "FaLinkedin", "FaXTwitter", "FaInstagram", "FaDribbble", "FaBehance", "FaYoutube", "FaMedium"];

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */
const inputCls = "w-full rounded-xl border px-4 py-3 text-base outline-none border-gray-300 bg-white text-gray-900 focus:border-teal-500 placeholder:text-gray-400 dark:border-white/10 dark:bg-black/30 dark:text-neutral-200 dark:focus:border-[#5eead4]/50 dark:placeholder:text-neutral-600";
const labelCls = "block mb-1.5 text-sm font-medium text-gray-600 dark:text-neutral-400";
const btnPrimary = "rounded-xl bg-[#5eead4] px-6 py-3 text-sm font-medium text-[#0a0e17] transition-opacity hover:opacity-90 disabled:opacity-50";
const btnDanger = "flex items-center justify-center rounded-xl border p-3 transition-colors border-red-300 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10";
const btnOutline = "rounded-xl border px-4 py-3 text-sm border-gray-300 text-gray-500 hover:text-gray-900 dark:border-white/10 dark:text-neutral-400 dark:hover:text-white";

function Field({ label, value, onChange, placeholder, type = "text", multiline = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={3} className={inputCls + " resize-y"} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={inputCls} />
      )}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Section Editors                                                    */
/* ------------------------------------------------------------------ */
function SiteConfigEditor({ data, onChange }: { data: SiteConfig; onChange: (d: SiteConfig) => void }) {
  const set = (key: keyof SiteConfig, val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full Name" value={data.name} onChange={(v) => set("name", v)} />
      <Field label="First Name (uppercase)" value={data.firstName} onChange={(v) => set("firstName", v)} />
      <Field label="Last Name (uppercase)" value={data.lastName} onChange={(v) => set("lastName", v)} />
      <Field label="Title" value={data.title} onChange={(v) => set("title", v)} placeholder="Full Stack Developer" />
      <Field label="Alternate Title" value={data.altTitle} onChange={(v) => set("altTitle", v)} placeholder="Software Engineer" />
      <Field label="Greeting" value={data.greeting} onChange={(v) => set("greeting", v)} placeholder="Hello! I'm" />
      <Field label="Description" value={data.description} onChange={(v) => set("description", v)} placeholder="A Full Stack" />
      <Field label="Email" value={data.email} onChange={(v) => set("email", v)} type="email" />
      <Field label="Phone" value={data.phone} onChange={(v) => set("phone", v)} placeholder="+91-XXXXXXXXXX" />
      <Field label="Website" value={data.website} onChange={(v) => set("website", v)} placeholder="https://yoursite.com" />
      <Field label="Location" value={data.location} onChange={(v) => set("location", v)} />
      <Field label="Years of Experience" value={data.yearsOfExperience} onChange={(v) => set("yearsOfExperience", v)} placeholder="5+" />
      <Field label="Resume URL" value={data.resumeUrl} onChange={(v) => set("resumeUrl", v)} />
    </div>
  );
}

function NavLinksEditor({ data, onChange }: { data: NavLink[]; onChange: (d: NavLink[]) => void }) {
  const update = (i: number, key: keyof NavLink, val: string) => {
    const copy = [...data]; copy[i] = { ...copy[i], [key]: val }; onChange(copy);
  };
  const add = () => onChange([...data, { label: "", href: "#", type: "anchor" }]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      {data.map((link, i) => (
        <div key={i} className="flex items-end gap-3">
          <div className="flex-1"><Field label="Label" value={link.label} onChange={(v) => update(i, "label", v)} /></div>
          <div className="flex-1"><Field label="Href" value={link.href} onChange={(v) => update(i, "href", v)} /></div>
          <button onClick={() => remove(i)} className={btnDanger}><FiTrash2 size={14} /></button>
        </div>
      ))}
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Link</button>
    </div>
  );
}

function SocialLinksEditor({ data, onChange }: { data: SocialLink[]; onChange: (d: SocialLink[]) => void }) {
  const update = (i: number, key: keyof SocialLink, val: string) => {
    const copy = [...data]; copy[i] = { ...copy[i], [key]: val }; onChange(copy);
  };
  const add = () => onChange([...data, { name: "", url: "", icon: "FaGithub" }]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {data.map((link, i) => (
        <div key={i} className="rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{link.name || `Social ${i + 1}`}</span>
            <button onClick={() => remove(i)} className={btnDanger}><FiTrash2 size={14} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name" value={link.name} onChange={(v) => update(i, "name", v)} placeholder="GitHub" />
            <Field label="URL" value={link.url} onChange={(v) => update(i, "url", v)} placeholder="https://github.com/..." />
            <div>
              <label className={labelCls}>Icon</label>
              <select value={link.icon} onChange={(e) => update(i, "icon", e.target.value)}
                className={inputCls + " cursor-pointer"}>
                {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Social</button>
    </div>
  );
}

function AboutEditor({ data, onChange }: { data: AboutData; onChange: (d: AboutData) => void }) {
  const updateParagraph = (i: number, val: string) => {
    const copy = [...data.paragraphs]; copy[i] = val; onChange({ ...data, paragraphs: copy });
  };
  const addParagraph = () => onChange({ ...data, paragraphs: [...data.paragraphs, ""] });
  const removeParagraph = (i: number) => onChange({ ...data, paragraphs: data.paragraphs.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <Field label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <div>
        <label className={labelCls}>Paragraphs</label>
        <div className="space-y-3">
          {data.paragraphs.map((p, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-1">
                <textarea value={p} onChange={(e) => updateParagraph(i, e.target.value)}
                  rows={3} className={inputCls + " resize-y"} placeholder={`Paragraph ${i + 1}`} />
              </div>
              <button onClick={() => removeParagraph(i)} className={btnDanger}><FiTrash2 size={14} /></button>
            </div>
          ))}
        </div>
        <button onClick={addParagraph} className={btnOutline + " mt-3 flex items-center gap-1"}><FiPlus size={12} /> Add Paragraph</button>
      </div>
    </div>
  );
}

function TrendingSkillsEditor({ data, onChange }: { data: string[]; onChange: (d: string[]) => void }) {
  const update = (i: number, val: string) => { const copy = [...data]; copy[i] = val; onChange(copy); };
  const add = () => onChange([...data, ""]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-neutral-500">Skills highlighted as trending / top skills on your portfolio.</p>
      <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
        {data.map((skill, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={skill} onChange={(e) => update(i, e.target.value)} className={inputCls} placeholder="Skill" />
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300"><FiTrash2 size={14} /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Skill</button>
    </div>
  );
}

function TechStackEditor({ data, onChange }: { data: string[]; onChange: (d: string[]) => void }) {
  const update = (i: number, val: string) => { const copy = [...data]; copy[i] = val; onChange(copy); };
  const add = () => onChange([...data, ""]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
        {data.map((tech, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={tech} onChange={(e) => update(i, e.target.value)} className={inputCls} placeholder="Technology" />
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300"><FiTrash2 size={14} /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Tech</button>
    </div>
  );
}

function TechCategoriesEditor({ data, onChange }: { data: TechCategory[]; onChange: (d: TechCategory[]) => void }) {
  const updateLabel = (i: number, val: string) => { const copy = [...data]; copy[i] = { ...copy[i], label: val }; onChange(copy); };
  const updateItem = (i: number, si: number, val: string) => {
    const copy = [...data]; const items = [...copy[i].items]; items[si] = val;
    copy[i] = { ...copy[i], items }; onChange(copy);
  };
  const addItem = (i: number) => { const copy = [...data]; copy[i] = { ...copy[i], items: [...copy[i].items, ""] }; onChange(copy); };
  const removeItem = (i: number, si: number) => {
    const copy = [...data]; copy[i] = { ...copy[i], items: copy[i].items.filter((_, j) => j !== si) }; onChange(copy);
  };
  const add = () => onChange([...data, { label: "", items: [] }]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {data.map((cat, i) => (
        <div key={i} className="rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{cat.label || `Category ${i + 1}`}</span>
            <button onClick={() => remove(i)} className={btnDanger}><FiTrash2 size={14} /></button>
          </div>
          <Field label="Label" value={cat.label} onChange={(v) => updateLabel(i, v)} placeholder="e.g. Mobile, Frontend" />
          <div>
            <label className={labelCls}>Items</label>
            <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
              {cat.items.map((item, si) => (
                <div key={si} className="flex items-center gap-2">
                  <input value={item} onChange={(e) => updateItem(i, si, e.target.value)} className={inputCls} placeholder="Technology" />
                  <button onClick={() => removeItem(i, si)} className="text-red-400 hover:text-red-300"><FiTrash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => addItem(i)} className={btnOutline + " flex items-center gap-1 mt-2"}><FiPlus size={12} /> Add Item</button>
          </div>
        </div>
      ))}
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Category</button>
    </div>
  );
}

function WhatIDoEditor({ data, onChange }: { data: WhatIDoItem[]; onChange: (d: WhatIDoItem[]) => void }) {
  const update = (i: number, key: keyof WhatIDoItem, val: unknown) => {
    const copy = [...data]; copy[i] = { ...copy[i], [key]: val }; onChange(copy);
  };
  const updateSkill = (i: number, si: number, val: string) => {
    const copy = [...data]; const skills = [...copy[i].skills]; skills[si] = val;
    copy[i] = { ...copy[i], skills }; onChange(copy);
  };
  const addSkill = (i: number) => { const copy = [...data]; copy[i] = { ...copy[i], skills: [...copy[i].skills, ""] }; onChange(copy); };
  const removeSkill = (i: number, si: number) => {
    const copy = [...data]; copy[i] = { ...copy[i], skills: copy[i].skills.filter((_, j) => j !== si) }; onChange(copy);
  };
  const add = () => onChange([...data, { title: "", description: "", skills: [] }]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{item.title || `Item ${i + 1}`}</span>
            <button onClick={() => remove(i)} className={btnDanger}><FiTrash2 size={14} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title" value={item.title} onChange={(v) => update(i, "title", v)} />
            <Field label="Description" value={item.description} onChange={(v) => update(i, "description", v)} multiline />
          </div>
          <div>
            <label className={labelCls}>Skills</label>
            <div className="flex flex-wrap gap-2">
              {item.skills.map((skill, si) => (
                <div key={si} className="flex items-center gap-1">
                  <input value={skill} onChange={(e) => updateSkill(i, si, e.target.value)}
                    className={inputCls + " !w-36"} placeholder="Skill" />
                  <button onClick={() => removeSkill(i, si)} className="text-red-400 hover:text-red-300"><FiTrash2 size={12} /></button>
                </div>
              ))}
              <button onClick={() => addSkill(i)} className="rounded-lg border border-dashed border-gray-300 dark:border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-gray-900 dark:text-neutral-500 dark:hover:text-white">
                + Skill
              </button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Section</button>
    </div>
  );
}

function CareerEditor({ data, onChange }: { data: CareerItem[]; onChange: (d: CareerItem[]) => void }) {
  const update = (i: number, key: keyof CareerItem, val: string) => {
    const copy = [...data]; copy[i] = { ...copy[i], [key]: val }; onChange(copy);
  };
  const updateBullet = (i: number, bi: number, val: string) => {
    const copy = [...data]; const bullets = [...(copy[i].bullets || [])]; bullets[bi] = val;
    copy[i] = { ...copy[i], bullets }; onChange(copy);
  };
  const addBullet = (i: number) => {
    const copy = [...data]; copy[i] = { ...copy[i], bullets: [...(copy[i].bullets || []), ""] }; onChange(copy);
  };
  const removeBullet = (i: number, bi: number) => {
    const copy = [...data]; copy[i] = { ...copy[i], bullets: (copy[i].bullets || []).filter((_, j) => j !== bi) }; onChange(copy);
  };
  const add = () => onChange([...data, { role: "", company: "", period: "", description: "", bullets: [] }]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{item.role || `Position ${i + 1}`}</span>
            <button onClick={() => remove(i)} className={btnDanger}><FiTrash2 size={14} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Role" value={item.role} onChange={(v) => update(i, "role", v)} placeholder="Senior Developer" />
            <Field label="Company" value={item.company} onChange={(v) => update(i, "company", v)} placeholder="Company Name" />
            <Field label="Period" value={item.period} onChange={(v) => update(i, "period", v)} placeholder="2023 - Present" />
            <Field label="Description (portfolio site)" value={item.description} onChange={(v) => update(i, "description", v)} multiline />
          </div>
          <div>
            <label className={labelCls}>Resume Bullets (ATS-friendly achievements)</label>
            <p className="mb-2 text-xs text-gray-400 dark:text-neutral-600">These appear on the /resume page. Use metrics and action verbs.</p>
            <div className="space-y-2">
              {(item.bullets || []).map((bullet, bi) => (
                <div key={bi} className="flex gap-2">
                  <div className="flex-1">
                    <textarea value={bullet} onChange={(e) => updateBullet(i, bi, e.target.value)}
                      rows={2} className={inputCls + " resize-y"} placeholder="Led development of X, resulting in Y% improvement..." />
                  </div>
                  <button onClick={() => removeBullet(i, bi)} className={btnDanger}><FiTrash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => addBullet(i)} className={btnOutline + " mt-2 flex items-center gap-1"}><FiPlus size={12} /> Add Bullet</button>
          </div>
        </div>
      ))}
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Position</button>
    </div>
  );
}

function ProjectsEditor({ data, onChange }: { data: ProjectItem[]; onChange: (d: ProjectItem[]) => void }) {
  const update = (i: number, key: keyof ProjectItem, val: string | null) => {
    const copy = [...data]; copy[i] = { ...copy[i], [key]: val }; onChange(copy);
  };
  const add = () => onChange([...data, {
    number: String(data.length + 1).padStart(2, "0"),
    title: "", category: "", tools: "", description: "", image: null, liveUrl: "#", githubUrl: "#",
  }]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{item.number} — {item.title || `Project ${i + 1}`}</span>
            <button onClick={() => remove(i)} className={btnDanger}><FiTrash2 size={14} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Number" value={item.number} onChange={(v) => update(i, "number", v)} placeholder="01" />
            <Field label="Title" value={item.title} onChange={(v) => update(i, "title", v)} placeholder="Project Name" />
            <Field label="Category" value={item.category} onChange={(v) => update(i, "category", v)} placeholder="Web Application" />
            <Field label="Tools" value={item.tools} onChange={(v) => update(i, "tools", v)} placeholder="React, Node.js" />
            <Field label="Live URL" value={item.liveUrl} onChange={(v) => update(i, "liveUrl", v)} placeholder="https://..." />
            <Field label="GitHub URL" value={item.githubUrl} onChange={(v) => update(i, "githubUrl", v)} placeholder="https://github.com/..." />
          </div>
          <Field label="Description" value={item.description} onChange={(v) => update(i, "description", v)} multiline />
          <Field label="Image Path" value={item.image || ""} onChange={(v) => update(i, "image", v || null)} placeholder="/images/project1.jpg (leave empty for gradient)" />
        </div>
      ))}
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Project</button>
    </div>
  );
}

function EducationEditor({ data, onChange }: { data: EducationItem[]; onChange: (d: EducationItem[]) => void }) {
  const update = (i: number, key: keyof EducationItem, val: string) => {
    const copy = [...data]; copy[i] = { ...copy[i], [key]: val }; onChange(copy);
  };
  const add = () => onChange([...data, { degree: "", field: "", institution: "", year: "", description: "" }]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{item.degree || `Education ${i + 1}`}</span>
            <button onClick={() => remove(i)} className={btnDanger}><FiTrash2 size={14} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Degree" value={item.degree} onChange={(v) => update(i, "degree", v)} placeholder="Bachelor of Technology" />
            <Field label="Field of Study" value={item.field} onChange={(v) => update(i, "field", v)} placeholder="Computer Science" />
            <Field label="Institution" value={item.institution} onChange={(v) => update(i, "institution", v)} placeholder="University Name" />
            <Field label="Year" value={item.year} onChange={(v) => update(i, "year", v)} placeholder="2019" />
          </div>
          <Field label="Description (optional)" value={item.description} onChange={(v) => update(i, "description", v)} multiline placeholder="Honors, GPA, relevant coursework..." />
        </div>
      ))}
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Education</button>
    </div>
  );
}

function CertificationsEditor({ data, onChange }: { data: string[]; onChange: (d: string[]) => void }) {
  const update = (i: number, val: string) => { const copy = [...data]; copy[i] = val; onChange(copy); };
  const add = () => onChange([...data, ""]);
  const remove = (i: number) => onChange(data.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      {data.map((cert, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex-1">
            <input value={cert} onChange={(e) => update(i, e.target.value)} className={inputCls} placeholder="AWS Certified Solutions Architect, 2024" />
          </div>
          <button onClick={() => remove(i)} className={btnDanger}><FiTrash2 size={14} /></button>
        </div>
      ))}
      <button onClick={add} className={btnOutline + " flex items-center gap-1"}><FiPlus size={12} /> Add Certification</button>
    </div>
  );
}

function AvailabilityEditor({ data, onChange }: { data: Availability; onChange: (d: Availability) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className={labelCls}>Available for hire</label>
        <button
          onClick={() => onChange({ ...data, isAvailable: !data.isAvailable })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.isAvailable ? "bg-[#5eead4]" : "bg-gray-300 dark:bg-white/10"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.isAvailable ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Roles" value={data.roles} onChange={(v) => onChange({ ...data, roles: v })} placeholder="Senior/Lead roles" />
        <Field label="Domains" value={data.domains} onChange={(v) => onChange({ ...data, domains: v })} placeholder="Full Stack & Mobile" />
        <Field label="Location" value={data.location} onChange={(v) => onChange({ ...data, location: v })} placeholder="Munich (onsite/hybrid) or Remote" />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={data.freelance}
          onChange={(e) => onChange({ ...data, freelance: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-[#5eead4] focus:ring-[#5eead4] dark:border-white/10"
        />
        <label className={labelCls + " !mb-0"}>Also open to freelance</label>
      </div>
    </div>
  );
}

function SectionHeadingsEditor({ data, onChange }: { data: SectionHeadings; onChange: (d: SectionHeadings) => void }) {
  const keys: (keyof SectionHeadings)[] = ["about", "whatIDo", "career", "projects", "techStack", "contact"];
  const labels: Record<keyof SectionHeadings, string> = {
    about: "About", whatIDo: "What I Do", career: "Career",
    projects: "Projects", techStack: "Tech Stack", contact: "Contact",
  };
  const update = (section: keyof SectionHeadings, field: keyof SectionHeading, val: string) => {
    onChange({ ...data, [section]: { ...data[section], [field]: val } });
  };

  return (
    <div className="space-y-4">
      {keys.map((key) => (
        <div key={key} className="rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-4">
          <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{labels[key]}</span>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Label" value={data[key].label} onChange={(v) => update(key, "label", v)} placeholder="01. ABOUT" />
            <Field label="Title" value={data[key].title} onChange={(v) => update(key, "title", v)} placeholder="Who I Am" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Login                                                              */
/* ------------------------------------------------------------------ */
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) onLogin();
      else setError("Invalid password");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0e17] p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5 p-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Access</h1>
          <p className="mt-2 text-base text-gray-500 dark:text-neutral-400">Enter password to continue</p>
        </div>
        <div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" autoFocus
            className="w-full rounded-xl border border-gray-300 bg-gray-50 dark:border-white/10 dark:bg-white/5 px-5 py-4 text-base text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-teal-500 dark:focus:border-[#5eead4]" />
          {error && <p className="mt-3 text-base text-red-500 dark:text-red-400">{error}</p>}
        </div>
        <button type="submit" disabled={loading || !password}
          className="w-full rounded-xl bg-[#5eead4] px-5 py-4 text-base font-medium text-[#0a0e17] transition-opacity hover:opacity-90 disabled:opacity-50">
          {loading ? "Verifying..." : "Enter"}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar Nav Item                                                   */
/* ------------------------------------------------------------------ */
const SECTION_LIST: { key: string; label: string }[] = [
  { key: "availability", label: "Availability" },
  { key: "siteConfig", label: "Site Config" },
  { key: "sectionHeadings", label: "Section Titles" },
  { key: "navLinks", label: "Navigation" },
  { key: "socialLinks", label: "Social Links" },
  { key: "aboutData", label: "About" },
  { key: "trendingSkills", label: "Trending Skills" },
  { key: "techStack", label: "Tech Stack" },
  { key: "techCategories", label: "Tech Categories" },
  { key: "whatIDo", label: "What I Do" },
  { key: "careerData", label: "Career" },
  { key: "projectsData", label: "Projects" },
  { key: "educationData", label: "Education" },
  { key: "certifications", label: "Certifications" },
];

/* ------------------------------------------------------------------ */
/*  Theme Toggle                                                       */
/* ------------------------------------------------------------------ */
function AdminThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
    >
      {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Editor                                                        */
/* ------------------------------------------------------------------ */
function Editor() {
  const [allData, setAllData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [sectionStatus, setSectionStatus] = useState<Record<string, "idle" | "saved" | "error">>({});
  const [activeSection, setActiveSection] = useState("siteConfig");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setAllData(json.data);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const saveSection = async (key: string) => {
    if (!allData) return;
    setSavingSection(key);
    try {
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: allData }),
      });
      setSectionStatus((s) => ({ ...s, [key]: res.ok ? "saved" : "error" }));
      if (res.ok) setTimeout(() => setSectionStatus((s) => ({ ...s, [key]: "idle" })), 3000);
    } catch {
      setSectionStatus((s) => ({ ...s, [key]: "error" }));
    } finally {
      setSavingSection(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.reload();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0e17]"><p className="text-gray-500 dark:text-neutral-400">Loading...</p></div>;
  if (error || !allData) return <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0e17]"><p className="text-red-500 dark:text-red-400">{error || "Failed"}</p></div>;

  const activeLabel = SECTION_LIST.find((s) => s.key === activeSection)?.label || "";

  const renderEditor = () => {
    switch (activeSection) {
      case "availability":
        return <AvailabilityEditor data={allData.availability} onChange={(d) => setAllData({ ...allData, availability: d })} />;
      case "siteConfig":
        return <SiteConfigEditor data={allData.siteConfig} onChange={(d) => setAllData({ ...allData, siteConfig: d })} />;
      case "sectionHeadings":
        return <SectionHeadingsEditor data={allData.sectionHeadings} onChange={(d) => setAllData({ ...allData, sectionHeadings: d })} />;
      case "navLinks":
        return <NavLinksEditor data={allData.navLinks} onChange={(d) => setAllData({ ...allData, navLinks: d })} />;
      case "socialLinks":
        return <SocialLinksEditor data={allData.socialLinks} onChange={(d) => setAllData({ ...allData, socialLinks: d })} />;
      case "aboutData":
        return <AboutEditor data={allData.aboutData} onChange={(d) => setAllData({ ...allData, aboutData: d })} />;
      case "trendingSkills":
        return <TrendingSkillsEditor data={allData.trendingSkills} onChange={(d) => setAllData({ ...allData, trendingSkills: d })} />;
      case "techStack":
        return <TechStackEditor data={allData.techStack} onChange={(d) => setAllData({ ...allData, techStack: d })} />;
      case "techCategories":
        return <TechCategoriesEditor data={allData.techCategories} onChange={(d) => setAllData({ ...allData, techCategories: d })} />;
      case "whatIDo":
        return <WhatIDoEditor data={allData.whatIDo} onChange={(d) => setAllData({ ...allData, whatIDo: d })} />;
      case "careerData":
        return <CareerEditor data={allData.careerData} onChange={(d) => setAllData({ ...allData, careerData: d })} />;
      case "projectsData":
        return <ProjectsEditor data={allData.projectsData} onChange={(d) => setAllData({ ...allData, projectsData: d })} />;
      case "educationData":
        return <EducationEditor data={allData.educationData} onChange={(d) => setAllData({ ...allData, educationData: d })} />;
      case "certifications":
        return <CertificationsEditor data={allData.certifications} onChange={(d) => setAllData({ ...allData, certifications: d })} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0e17]">
      {/* Left Sidebar */}
      <aside className="sticky top-0 flex h-screen w-72 flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
        {/* Logo */}
        <div className="border-b border-gray-200 dark:border-white/10 px-6 py-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Editor</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-neutral-500">Manage your content</p>
        </div>

        {/* Section links */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-1">
            {SECTION_LIST.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm transition-colors ${
                  activeSection === section.key
                    ? "bg-[#5eead4]/10 font-medium text-[#5eead4]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <span>{section.label}</span>
                {sectionStatus[section.key] === "saved" && (
                  <span className="h-2 w-2 rounded-full bg-[#5eead4]" />
                )}
                {sectionStatus[section.key] === "error" && (
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-200 dark:border-white/10 px-4 py-5 space-y-2">
          <AdminThemeToggle />
          <button onClick={() => {
            if (!allData) return;
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "portfolio.json";
            a.click();
            URL.revokeObjectURL(url);
          }} className="flex w-full items-center rounded-xl px-4 py-3 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white">
            Download JSON
          </button>
          <button onClick={loadData} className="flex w-full items-center rounded-xl px-4 py-3 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white">
            Reload Data
          </button>
          <button onClick={handleLogout} className="flex w-full items-center rounded-xl px-4 py-3 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-500 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-red-400">
            Logout
          </button>
        </div>
      </aside>

      {/* Right Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Section header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 dark:border-white/10 dark:bg-[#0a0e17]/95 px-10 py-5 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{activeLabel}</h2>
          <div className="flex items-center gap-4">
            {sectionStatus[activeSection] === "saved" && (
              <span className="rounded-lg bg-[#5eead4]/20 px-3 py-1.5 text-sm text-[#5eead4]">Saved</span>
            )}
            {sectionStatus[activeSection] === "error" && (
              <span className="rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-400">Save failed</span>
            )}
            <button
              onClick={() => saveSection(activeSection)}
              disabled={savingSection === activeSection}
              className={btnPrimary}
            >
              {savingSection === activeSection ? "Saving..." : "Save Section"}
            </button>
          </div>
        </div>

        {/* Editor area */}
        <div className="px-10 py-8">
          {renderEditor()}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    document.body.classList.add("admin-page");
    return () => document.body.classList.remove("admin-page");
  }, []);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => { if (res.ok) setAuthenticated(true); })
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0e17]"><p className="text-gray-500 dark:text-neutral-400">Loading...</p></div>;
  if (!authenticated) return <LoginForm onLogin={() => setAuthenticated(true)} />;
  return <Editor />;
}
