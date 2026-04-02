"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { FiPlus, FiTrash2, FiSun, FiMoon, FiMenu, FiX, FiBarChart2, FiToggleLeft, FiSettings, FiLayout, FiNavigation, FiShare2, FiUser, FiTrendingUp, FiCpu, FiGrid, FiTarget, FiBriefcase, FiFolder, FiBookOpen, FiAward, FiFileText } from "react-icons/fi";

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
            <p className="mb-2 text-xs text-gray-400 dark:text-neutral-500">These appear on the /resume page. Use metrics and action verbs.</p>
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

interface AnalyticsStats {
  totals: { total: number; today: number; week: number; month: number };
  topPages: { path: string; views: number }[];
  dailyViews: { date: string; views: number }[];
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
  referrers: { referrer: string; count: number }[];
}

function DashboardEditor() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500 dark:text-neutral-500">Loading analytics...</p>;
  if (!stats) return <p className="text-sm text-red-500">Failed to load analytics</p>;

  const maxDailyViews = Math.max(...stats.dailyViews.map((d) => d.views), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today", value: stats.totals.today },
          { label: "This Week", value: stats.totals.week },
          { label: "This Month", value: stats.totals.month },
          { label: "All Time", value: stats.totals.total },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 dark:border-white/5 p-5">
            <p className="text-sm text-gray-500 dark:text-neutral-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{Number(card.value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Daily views chart (bar chart using divs) */}
      <div className="rounded-xl border border-gray-200 dark:border-white/5 p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-neutral-300">Page Views (Last 14 Days)</h3>
        <div className="flex items-end gap-1.5" style={{ height: 160 }}>
          {stats.dailyViews.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 dark:text-neutral-500">{d.views}</span>
              <div
                className="w-full rounded-t bg-[#5eead4] transition-all"
                style={{ height: `${(d.views / maxDailyViews) * 120}px`, minHeight: d.views > 0 ? 4 : 0 }}
              />
              <span className="text-[10px] text-gray-400 dark:text-neutral-500">
                {new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top pages */}
        <div className="rounded-xl border border-gray-200 dark:border-white/5 p-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-neutral-300">Top Pages</h3>
          <div className="space-y-2">
            {stats.topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between">
                <span className="truncate text-sm text-gray-600 dark:text-neutral-400">{p.path}</span>
                <span className="ml-2 shrink-0 text-sm font-medium text-gray-900 dark:text-white">{p.views}</span>
              </div>
            ))}
            {stats.topPages.length === 0 && <p className="text-sm text-gray-400 dark:text-neutral-500">No data yet</p>}
          </div>
        </div>

        {/* Devices & Browsers */}
        <div className="rounded-xl border border-gray-200 dark:border-white/5 p-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-neutral-300">Devices</h3>
          <div className="space-y-2 mb-5">
            {stats.devices.map((d) => (
              <div key={d.device} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400 capitalize">{d.device}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{d.count}</span>
              </div>
            ))}
          </div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-neutral-300">Browsers</h3>
          <div className="space-y-2">
            {stats.browsers.map((b) => (
              <div key={b.browser} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">{b.browser}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referrers */}
      {stats.referrers.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-white/5 p-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-neutral-300">Top Referrers</h3>
          <div className="space-y-2">
            {stats.referrers.map((r) => (
              <div key={r.referrer} className="flex items-center justify-between">
                <span className="truncate text-sm text-gray-600 dark:text-neutral-400">{r.referrer}</span>
                <span className="ml-2 shrink-0 text-sm font-medium text-gray-900 dark:text-white">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TailorAnalysis {
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

type ApplicationStatus = 'draft' | 'applied' | 'accepted' | 'rejected' | 'no_reply';

interface HistoryItem {
  id: number;
  job_title: string;
  company: string;
  match_score: number;
  status: ApplicationStatus;
  applied_at: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-neutral-400" },
  applied: { label: "Applied", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
  no_reply: { label: "No Reply", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400" },
};

function TailorResumeEditor({ portfolioData, onPortfolioUpdate }: { portfolioData: PortfolioData; onPortfolioUpdate: (d: PortfolioData) => void }) {
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<TailorAnalysis | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"tailor" | "history">("tailor");
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [savedId, setSavedId] = useState<number | null>(null);
  const [savedJobs, setSavedJobs] = useState<{ id: string; title: string; company: string; description: string; job_url: string }[]>([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [generatingCL, setGeneratingCL] = useState(false);

  useEffect(() => {
    fetch("/api/resume/tailor/history")
      .then((r) => r.ok ? r.json() : { resumes: [] })
      .then((d) => setHistory(d.resumes || []))
      .catch(() => {});
    fetch("/api/jobs?limit=50&sort=match_score")
      .then((r) => r.ok ? r.json() : { jobs: [] })
      .then((d) => setSavedJobs((d.jobs || []).filter((j: { description: string }) => j.description)))
      .catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    setSavedId(null);
    setCoverLetter("");
    try {
      const res = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, jdUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data.analysis);
      setSelectedSkills(new Set(data.analysis.skillsReordered));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const handleSave = async (openResume: boolean) => {
    if (!analysis) return;
    setSaving(true);

    const allSkills = [...portfolioData.techStack, ...portfolioData.techCategories.flatMap((c) => c.items)];
    const uniqueSkills = [...new Set(allSkills)];
    const included = uniqueSkills.filter((s) => selectedSkills.has(s));
    const excluded = uniqueSkills.filter((s) => !selectedSkills.has(s));

    const linkedin = portfolioData.socialLinks.find((l) => l.name === "LinkedIn");
    const github = portfolioData.socialLinks.find((l) => l.name === "GitHub");

    const tailoredData = {
      summary: analysis.suggestedSummary,
      skills: [...selectedSkills],
      techCategories: portfolioData.techCategories.map((cat) => ({
        label: cat.label,
        items: cat.items.filter((item) => selectedSkills.has(item)),
      })).filter((cat) => cat.items.length > 0),
      career: portfolioData.careerData.map((job, i) => ({
        role: job.role,
        company: job.company,
        period: job.period,
        bullets: analysis.tailoredBullets[String(i)] || job.bullets || [job.description],
      })),
      education: portfolioData.educationData,
      siteConfig: {
        name: portfolioData.siteConfig.name,
        title: portfolioData.siteConfig.title,
        yearsOfExperience: portfolioData.siteConfig.yearsOfExperience,
        location: portfolioData.siteConfig.location,
        phone: portfolioData.siteConfig.phone,
        email: portfolioData.siteConfig.email,
        website: portfolioData.siteConfig.website,
        linkedin: linkedin?.url || "",
        github: github?.url || "",
      },
      analysis: {
        matchScore: analysis.matchScore,
        jobTitle: analysis.jobTitle,
        company: analysis.company,
        suggestedSummary: analysis.suggestedSummary,
        skillAnalysis: analysis.skillAnalysis,
        tailoredBullets: analysis.tailoredBullets,
        skillsReordered: analysis.skillsReordered,
      },
    };

    try {
      const payload = {
        jobTitle: analysis.jobTitle,
        company: analysis.company,
        jdText,
        jdUrl: jdUrl || null,
        tailoredData,
        skillsIncluded: included,
        skillsExcluded: excluded,
        matchScore: analysis.matchScore,
      };

      let resumeId = savedId;

      if (savedId) {
        // Update existing record
        const res = await fetch(`/api/resume/tailor/${savedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Update failed" }));
          throw new Error(data.error || "Update failed");
        }
      } else {
        // Create new record
        const res = await fetch("/api/resume/tailor/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");
        resumeId = data.resume.id;
        setSavedId(resumeId);
      }

      const histRes = await fetch("/api/resume/tailor/history");
      const histData = await histRes.json();
      setHistory(histData.resumes || []);
      if (openResume && resumeId) {
        window.open(`/resume/tailored/${resumeId}`, "_blank");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/resume/tailor/${id}`, { method: "DELETE" });
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const handleStatusChange = async (id: number, status: ApplicationStatus) => {
    const res = await fetch(`/api/resume/tailor/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setHistory((prev) => prev.map((r) => r.id === id ? { ...r, status, applied_at: status === "applied" ? new Date().toISOString() : r.applied_at } : r));
    }
  };

  const loadFromHistory = async (id: number) => {
    try {
      const res = await fetch(`/api/resume/tailor/${id}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      const record = data.resume;
      const td = typeof record.tailored_data === "string" ? JSON.parse(record.tailored_data) : record.tailored_data;
      const savedAnalysis = td.analysis;

      if (savedAnalysis) {
        // Restore full analysis from saved data
        setAnalysis(savedAnalysis);
        setSelectedSkills(new Set(savedAnalysis.skillsReordered || []));
      } else {
        // Fallback for old records without saved analysis
        const si = typeof record.skills_included === "string" ? JSON.parse(record.skills_included) : (record.skills_included || []);
        const se = typeof record.skills_excluded === "string" ? JSON.parse(record.skills_excluded) : (record.skills_excluded || []);
        setAnalysis({
          matchScore: record.match_score || 0,
          jobTitle: record.job_title,
          company: record.company || "",
          suggestedSummary: td.summary || "",
          skillAnalysis: {
            matched: si as string[],
            inResumeNotJD: se as string[],
            inJDNotResume: [],
          },
          tailoredBullets: Object.fromEntries(
            (td.career || []).map((c: { bullets: string[] }, i: number) => [String(i), c.bullets])
          ),
          skillsReordered: si as string[],
        });
        setSelectedSkills(new Set(si as string[]));
      }
      setJdText(record.jd_text || "");
      setJdUrl(record.jd_url || "");
      setSavedId(record.id);
      setActiveTab("tailor");
    } catch {
      setError("Failed to load from history");
    }
  };

  const addToProfile = async (skill: string) => {
    const updated = {
      ...portfolioData,
      techStack: [...portfolioData.techStack, skill],
    };
    try {
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updated }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Failed to save");
      }
      onPortfolioUpdate(updated);
      setAddedSkills((prev) => new Set([...prev, skill]));
      setSelectedSkills((prev) => new Set([...prev, skill]));
    } catch (err) {
      setError(`Failed to add "${skill}": ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!analysis) return;
    setGeneratingCL(true);
    setCoverLetter("");
    try {
      const res = await fetch("/api/resume/tailor/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, jobTitle: analysis.jobTitle, company: analysis.company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setCoverLetter(data.coverLetter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover letter generation failed");
    } finally {
      setGeneratingCL(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("tailor")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "tailor"
              ? "bg-[#5eead4] text-[#0a0e17]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
          }`}
        >
          Tailor Resume
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-[#5eead4] text-[#0a0e17]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
          }`}
        >
          History ({history.length})
        </button>
      </div>

      {activeTab === "history" && (
        <div className="space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-neutral-500">No tailored resumes yet.</p>
          )}
          {history.map((item) => {
            const statusCfg = STATUS_CONFIG[item.status || "draft"];
            return (
              <div key={item.id} className="rounded-xl border border-gray-200 dark:border-white/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.job_title}{item.company ? ` — ${item.company}` : ""}
                      </p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                      {new Date(item.created_at).toLocaleDateString()} · {item.match_score}% match
                      {item.applied_at && ` · Applied ${new Date(item.applied_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={item.status || "draft"}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as ApplicationStatus)}
                    className="rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/30 px-2.5 py-1.5 text-xs text-gray-600 dark:text-neutral-400 cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="applied">Applied</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="no_reply">No Reply</option>
                  </select>
                  <button
                    onClick={() => loadFromHistory(item.id)}
                    className="rounded-lg border border-gray-300 dark:border-white/10 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
                  >
                    Edit
                  </button>
                  <a
                    href={`/resume/tailored/${item.id}`}
                    target="_blank"
                    className="rounded-lg border border-gray-300 dark:border-white/10 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
                  >
                    Resume
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg border border-red-300 dark:border-red-500/30 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "tailor" && (
        <>
          {/* Step 1: Input */}
          <div className="space-y-4">
            {/* Load from saved jobs */}
            {savedJobs.length > 0 && (
              <div>
                <label className={labelCls}>Load from Saved Jobs</label>
                <select
                  onChange={(e) => {
                    const job = savedJobs.find((j) => j.id === e.target.value);
                    if (job) {
                      setJdText(job.description);
                      setJdUrl(job.job_url || "");
                      setAnalysis(null);
                      setSavedId(null);
                    }
                  }}
                  defaultValue=""
                  className={inputCls + " cursor-pointer"}
                >
                  <option value="" disabled>Select a saved job...</option>
                  {savedJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} — {job.company}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelCls}>Paste Job Description</label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={8}
                className={inputCls + " resize-y"}
                placeholder="Paste the full job description here..."
              />
            </div>
            <Field label="Job URL (optional)" value={jdUrl} onChange={setJdUrl} placeholder="https://linkedin.com/jobs/..." />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || (!jdText && !jdUrl)}
              className={btnPrimary}
            >
              {analyzing ? "Analyzing with Claude..." : "Analyze Job Description"}
            </button>
            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          </div>

          {/* Step 2: Skill Picker */}
          {analysis && (
            <div className="space-y-6 rounded-xl border border-gray-200 dark:border-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {analysis.jobTitle}{analysis.company ? ` @ ${analysis.company}` : ""}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">Select skills to include in tailored resume</p>
                </div>
                <span className={`rounded-full px-4 py-2 text-sm font-bold ${
                  analysis.matchScore >= 70 ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                  : analysis.matchScore >= 40 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                }`}>
                  {analysis.matchScore}% Match
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">
                    Matched Skills ({analysis.skillAnalysis.matched.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillAnalysis.matched.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          selectedSkills.has(skill)
                            ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                            : "bg-gray-100 text-gray-400 line-through dark:bg-white/5 dark:text-neutral-500"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-600 dark:text-neutral-400">
                    Your Other Skills ({analysis.skillAnalysis.inResumeNotJD.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillAnalysis.inResumeNotJD.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          selectedSkills.has(skill)
                            ? "bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-neutral-200"
                            : "bg-gray-100 text-gray-400 line-through dark:bg-white/5 dark:text-neutral-500"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">
                    Missing from Profile ({analysis.skillAnalysis.inJDNotResume.length})
                  </h4>
                  <p className="mb-2 text-xs text-gray-400 dark:text-neutral-500">Click + to add to your profile</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillAnalysis.inJDNotResume.map((skill) => (
                      addedSkills.has(skill) ? (
                        <span
                          key={skill}
                          className="rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-600 dark:bg-green-500/10 dark:text-green-400"
                        >
                          {skill} ✓
                        </span>
                      ) : (
                        <button
                          key={skill}
                          onClick={() => addToProfile(skill)}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                        >
                          <FiPlus size={12} /> {skill}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-neutral-300">Tailored Summary</h4>
                <p className="rounded-lg bg-gray-50 dark:bg-white/5 p-4 text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                  {analysis.suggestedSummary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className={btnOutline}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className={btnPrimary}
                >
                  {saving ? "Saving..." : "Save & View Resume"}
                </button>
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCL}
                  className={btnOutline}
                >
                  {generatingCL ? "Generating Cover Letter..." : "Generate Cover Letter"}
                </button>
              </div>

              {/* Cover Letter */}
              {coverLetter && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Cover Letter</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(coverLetter); }}
                        className={btnOutline + " !py-1.5 !px-3 !text-xs"}
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams({
                            text: coverLetter,
                            job: analysis?.jobTitle || "",
                            company: analysis?.company || "",
                          });
                          window.open(`/resume/cover-letter?${params.toString()}`, "_blank");
                        }}
                        className={btnPrimary + " !py-1.5 !px-3 !text-xs"}
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-5 text-sm leading-relaxed text-gray-700 dark:text-neutral-300 whitespace-pre-wrap">
                    {coverLetter}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
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
interface SectionItem { key: string; label: string; icon: React.ReactNode; }
interface SectionGroup { group: string; items: SectionItem[]; }

const SECTION_GROUPS: SectionGroup[] = [
  {
    group: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard", icon: <FiBarChart2 size={16} /> },
      { key: "availability", label: "Availability", icon: <FiToggleLeft size={16} /> },
    ],
  },
  {
    group: "Site Settings",
    items: [
      { key: "siteConfig", label: "Site Config", icon: <FiSettings size={16} /> },
      { key: "sectionHeadings", label: "Section Titles", icon: <FiLayout size={16} /> },
      { key: "navLinks", label: "Navigation", icon: <FiNavigation size={16} /> },
      { key: "socialLinks", label: "Social Links", icon: <FiShare2 size={16} /> },
    ],
  },
  {
    group: "Content",
    items: [
      { key: "aboutData", label: "About", icon: <FiUser size={16} /> },
      { key: "careerData", label: "Career", icon: <FiBriefcase size={16} /> },
      { key: "projectsData", label: "Projects", icon: <FiFolder size={16} /> },
      { key: "educationData", label: "Education", icon: <FiBookOpen size={16} /> },
      { key: "certifications", label: "Certifications", icon: <FiAward size={16} /> },
      { key: "whatIDo", label: "What I Do", icon: <FiTarget size={16} /> },
    ],
  },
  {
    group: "Skills & Tech",
    items: [
      { key: "trendingSkills", label: "Trending Skills", icon: <FiTrendingUp size={16} /> },
      { key: "techStack", label: "Tech Stack", icon: <FiCpu size={16} /> },
      { key: "techCategories", label: "Tech Categories", icon: <FiGrid size={16} /> },
    ],
  },
  {
    group: "Tools",
    items: [
      { key: "tailorResume", label: "Tailor Resume", icon: <FiFileText size={16} /> },
    ],
  },
];

// Flat list for lookups
const SECTION_LIST = SECTION_GROUPS.flatMap((g) => g.items);

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

function PublishButton() {
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handlePublish = async () => {
    if (!confirm("Publish all changes to the live site?")) return;
    setPublishing(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/admin/data/publish", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Publish failed" }));
        throw new Error(data.error);
      }
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <button
      onClick={handlePublish}
      disabled={publishing}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-[13px] font-medium transition-colors ${
        status === "success"
          ? "bg-green-500/20 text-green-600 dark:text-green-400"
          : status === "error"
          ? "bg-red-500/20 text-red-600 dark:text-red-400"
          : "bg-[#5eead4] text-[#0a0e17] hover:opacity-90"
      }`}
    >
      {publishing ? "Publishing..." : status === "success" ? "Published!" : status === "error" ? "Publish Failed" : "Publish to Live Site"}
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
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      case "dashboard":
        return <DashboardEditor />;
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
      case "tailorResume":
        return <TailorResumeEditor portfolioData={allData} onPortfolioUpdate={(d) => setAllData(d)} />;
      default:
        return null;
    }
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 px-5 py-5">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">Portfolio Editor</h1>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">Manage your content</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-gray-400 dark:text-neutral-500 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-white lg:hidden">
          <FiX size={18} />
        </button>
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {SECTION_GROUPS.map((group, gi) => (
          <div key={group.group} className={gi > 0 ? "mt-5" : ""}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((section) => (
                <button
                  key={section.key}
                  onClick={() => { setActiveSection(section.key); setSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
                    activeSection === section.key
                      ? "bg-[#5eead4]/10 font-medium text-[#5eead4]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <span className={activeSection === section.key ? "text-[#5eead4]" : "text-gray-400 dark:text-neutral-500"}>{section.icon}</span>
                  <span className="flex-1">{section.label}</span>
                  {sectionStatus[section.key] === "saved" && (
                    <span className="h-2 w-2 rounded-full bg-[#5eead4]" />
                  )}
                  {sectionStatus[section.key] === "error" && (
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-200 dark:border-white/10 px-3 py-4 space-y-1">
        <PublishButton />
        <AdminThemeToggle />
        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] text-gray-500 hover:bg-gray-100 hover:text-red-500 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-red-400">
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0e17]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — fixed on mobile, sticky on desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 dark:border-white/10 dark:bg-[#0d1117] lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>

      {/* Right Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Section header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 dark:border-white/10 dark:bg-[#0a0e17]/95 px-6 py-4 backdrop-blur-sm lg:px-10 lg:py-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white lg:hidden">
              <FiMenu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{activeLabel}</h2>
          </div>
          {activeSection !== "tailorResume" && activeSection !== "dashboard" && (
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
          )}
        </div>

        {/* Editor area */}
        <div className="px-5 py-6 lg:px-10 lg:py-8">
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
