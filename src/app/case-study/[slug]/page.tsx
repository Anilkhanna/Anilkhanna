import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { caseStudies, siteConfig, availability } from "@/data/portfolio";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((cs) => cs.slug === slug);
  if (!study) return {};

  const description = study.problem[0].slice(0, 160);

  return {
    title: `${study.title} — Case Study | ${siteConfig.name}`,
    description,
    openGraph: {
      title: `${study.title} — Case Study`,
      description,
      type: "article",
      url: `${siteConfig.website}/case-study/${study.slug}`,
      ...(study.image && { images: [{ url: study.image }] }),
    },
  };
}

function Section({
  heading,
  paragraphs,
}: {
  heading: string;
  paragraphs: string[];
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
      {paragraphs.map((p, i) => (
        <p key={i} className="leading-relaxed text-muted">
          {p}
        </p>
      ))}
    </div>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = caseStudies.find((cs) => cs.slug === slug);
  if (!study) notFound();

  const topPadding = availability.isAvailable ? "pt-28" : "pt-20";

  return (
    <>
      <Navbar />
      <main className={`${topPadding} bg-background`}>
        {/* Hero */}
        <section className="px-6 pb-12 md:px-[120px]">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/#work"
              className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-accent transition-colors hover:text-foreground"
            >
              <FiArrowLeft size={14} />
              Back to projects
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold tracking-[1px] text-accent">
                {study.category}
              </span>
              <span className="text-border">·</span>
              <span className="font-mono text-[11px] text-muted">
                {study.tools}
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
              {study.title}
            </h1>

            {study.image && (
              <div className="mb-10 overflow-hidden rounded-xl border border-border">
                <img
                  src={study.image}
                  alt={study.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-20 md:px-[120px]">
          <div className="mx-auto max-w-3xl space-y-12">
            <Section heading="The Problem" paragraphs={study.problem} />
            <Section heading="Approach" paragraphs={study.approach} />
            <Section heading="Challenges" paragraphs={study.challenges} />
            <Section heading="Results" paragraphs={study.results} />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-surface px-6 py-16 md:px-[120px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Interested in working together?
            </h2>
            <p className="mb-8 text-muted">
              I&apos;m available for senior and lead roles, freelance projects,
              and technical consulting.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
            >
              <FiMail size={16} />
              Get in touch
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
