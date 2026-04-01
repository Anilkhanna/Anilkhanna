import { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiCalendar } from "react-icons/fi";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { siteConfig, availability } from "@/data/portfolio";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description:
    "Thoughts on software engineering, system design, and building great products.",
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description:
      "Thoughts on software engineering, system design, and building great products.",
    type: "website",
    url: `${siteConfig.website}/blog`,
  },
};

export default function BlogPage() {
  const topPadding = availability.isAvailable ? "pt-28" : "pt-20";
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className={`${topPadding} bg-background`}>
        <section className="px-6 pb-16 md:px-[120px]">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-accent transition-colors hover:text-foreground"
            >
              <FiArrowLeft size={14} />
              Back to Portfolio
            </Link>

            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Blog
            </h1>
            <p className="mb-12 max-w-2xl text-lg leading-relaxed text-muted">
              Thoughts on software engineering, system design, and building
              great products.
            </p>

            {posts.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center">
                <p className="text-lg text-muted">
                  Posts coming soon &mdash; check back later.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block rounded-xl border border-border bg-surface p-6 transition-colors hover:bg-surface-hover"
                  >
                    <h2 className="mb-2 text-xl font-bold text-foreground">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mb-4 text-sm leading-relaxed text-muted">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                      {post.date && (
                        <span className="inline-flex items-center gap-1">
                          <FiCalendar size={12} />
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      {post.readingTime && (
                        <span className="inline-flex items-center gap-1">
                          <FiClock size={12} />
                          {post.readingTime}
                        </span>
                      )}
                      {post.tags.length > 0 && (
                        <div className="flex gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-surface-hover px-2 py-0.5 font-mono text-xs text-accent"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
