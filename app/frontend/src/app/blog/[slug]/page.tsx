"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Tag,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { posts } from "../posts";

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main className="relative min-h-screen bg-[#FFFFFF] text-[#212121] antialiased">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Post not found</h1>
            <p className="mt-2 text-[#8a8a8a]">
              The blog post you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#34c759]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to blog
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen bg-[#FFFFFF] text-[#212121] antialiased"
      style={{
        fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
      }}
    >
      {/* JSON-LD for blog post */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: {
              "@type": "Person",
              name: post.author,
            },
            publisher: {
              "@type": "Organization",
              name: "Offbank",
              url: "https://offbankpay.com",
            },
            url: `https://offbankpay.com/blog/${post.slug}`,
            keywords: post.tags.join(", "),
          }),
        }}
      />

      {/* FAQ schema for AEO - only if post has FAQs */}
      {post.faqs && post.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: post.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      )}

      <Navbar />

      <article className="relative pt-32 pb-24 md:pt-40">
        <div className="absolute left-1/2 top-32 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#34c759]/[0.03] blur-[120px]" />

        <div className="mx-auto max-w-3xl px-6">
          {/* Back link */}
          <Reveal>
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-[#8a8a8a] transition-colors hover:text-[#5c5c5c]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All posts
            </Link>
          </Reveal>

          {/* Header */}
          <Reveal delay={0.05}>
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-[#5c5c5c]">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {post.author}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-4 text-lg leading-relaxed text-[#5c5c5c]">
              {post.excerpt}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-[#f2f2f2] px-2.5 py-1 text-xs font-medium text-[#5c5c5c]"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Divider */}
          <div className="mt-10 mb-10 h-px bg-[#f2f2f2]" />

          {/* Content */}
          <Reveal delay={0.25}>
            <div
              className="prose-offbank"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </Reveal>

          {/* FAQ section - visible for AEO + user trust */}
          {post.faqs && post.faqs.length > 0 && (
            <Reveal delay={0.3}>
              <div className="mt-14">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                  <HelpCircle className="h-5 w-5 text-[#34c759]" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-5">
                  {post.faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[#d3d3d3] bg-[#FAFAF8] p-5"
                    >
                      <h3 className="text-[15px] font-semibold text-[#212121]">
                        {faq.question}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#5c5c5c]">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Bottom CTA */}
          <Reveal delay={0.1}>
            <div className="mt-16 rounded-xl border border-[#d3d3d3] bg-[#fafafa] p-8 text-center">
              <h3 className="text-xl font-semibold text-[#212121]">
                Ready to settle without bank interference?
              </h3>
              <p className="mt-2 text-sm text-[#5c5c5c]">
                Non-custodial, 1% flat fees, instant settlement. Integrate in
                under 30 minutes.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#34c759] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2ba048] hover:scale-[1.02]"
                >
                  Get started free
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d3d3d3] bg-white px-6 py-3 text-sm font-medium text-[#212121] transition-colors hover:bg-[#f2f2f2]"
                >
                  Read the docs
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </article>

      <Footer />
    </main>
  );
}
