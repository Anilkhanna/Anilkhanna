import { Metadata } from "next";
import Link from "next/link";
import {
  FiArrowLeft,
  FiMail,
  FiSmartphone,
  FiGlobe,
  FiServer,
  FiUsers,
} from "react-icons/fi";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { services, siteConfig, availability } from "@/data/portfolio";

const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  smartphone: FiSmartphone,
  globe: FiGlobe,
  server: FiServer,
  users: FiUsers,
};

export const metadata: Metadata = {
  title: `Freelance Services | ${siteConfig.name}`,
  description: services.intro,
  openGraph: {
    title: `Freelance Services | ${siteConfig.name}`,
    description: services.intro,
    type: "website",
    url: `${siteConfig.website}/services`,
  },
};

export default function ServicesPage() {
  const topPadding = availability.isAvailable ? "pt-28" : "pt-20";

  return (
    <>
      <Navbar />
      <main className={`${topPadding} bg-background`}>
        {/* Hero */}
        <section className="px-6 pb-12 md:px-[120px]">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-accent transition-colors hover:text-foreground"
            >
              <FiArrowLeft size={14} />
              Back to Portfolio
            </Link>

            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              {services.headline}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted">
              {services.intro}
            </p>
          </div>
        </section>

        {/* Service Cards */}
        <section className="px-6 pb-16 md:px-[120px]">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {services.offerings.map((offering) => {
              const Icon = iconMap[offering.icon];
              return (
                <div
                  key={offering.title}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    {Icon && <Icon size={22} className="text-accent" />}
                    <h3 className="text-lg font-bold text-foreground">
                      {offering.title}
                    </h3>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-muted">
                    {offering.description}
                  </p>
                  <ul className="space-y-1">
                    {offering.deliverables.map((d) => (
                      <li
                        key={d}
                        className="text-sm text-muted before:mr-2 before:text-accent before:content-['▸']"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-border bg-surface px-6 py-16 md:px-[120px]">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Pricing
            </h2>
            <p className="mb-1 text-4xl font-bold text-accent">
              {services.pricing.hourlyRate}
            </p>
            <p className="text-sm text-muted">{services.pricing.note}</p>
          </div>
        </section>

        {/* Process */}
        <section className="px-6 py-16 md:px-[120px]">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
              How I Work
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {services.process.map((item, i) => (
                <div key={item.step} className="text-center">
                  <span className="mb-2 inline-block font-mono text-3xl font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-1 text-lg font-bold text-foreground">
                    {item.step}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-surface px-6 py-16 md:px-[120px]">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Ready to get started?
            </h2>
            <p className="mb-8 text-muted">
              Drop me a line and let&apos;s discuss your project.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
            >
              <FiMail size={16} />
              Say Hello
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
