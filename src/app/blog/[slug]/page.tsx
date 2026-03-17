import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiClock, FiCalendar, FiMail } from "react-icons/fi";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { siteConfig, availability } from "@/data/portfolio";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | ${siteConfig.name}`,
      description: post.excerpt,
      type: "article",
      url: `${siteConfig.website}/blog/${post.slug}`,
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const topPadding = availability.isAvailable ? "pt-28" : "pt-20";

  return (
    <>
      <Navbar />
      <main className={`${topPadding} bg-background`}>
        <article className="px-6 pb-16 md:px-[120px]">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-accent transition-colors hover:text-foreground"
            >
              <FiArrowLeft size={14} />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-10">
              <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                {post.date && (
                  <span className="inline-flex items-center gap-1">
                    <FiCalendar size={14} />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                {post.readingTime && (
                  <span className="inline-flex items-center gap-1">
                    <FiClock size={14} />
                    {post.readingTime}
                  </span>
                )}
              </div>
              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-hover px-3 py-1 font-mono text-xs text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none">
              <MDXRemote
                source={post.content}
                options={{
                  mdxOptions: {
                    rehypePlugins: [
                      [rehypePrettyCode, { theme: "github-dark" }],
                    ],
                  },
                }}
              />
            </div>

            {/* CTA */}
            <section className="mt-16 rounded-xl border border-border bg-surface p-8 text-center">
              <h2 className="mb-2 text-xl font-bold text-foreground">
                Enjoyed this post?
              </h2>
              <p className="mb-6 text-sm text-muted">
                Let&apos;s connect and discuss ideas.
              </p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
              >
                <FiMail size={16} />
                Get in Touch
              </a>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
