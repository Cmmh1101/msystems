import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface PublishedPost {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published_at: string;
}

async function getPublishedPost(slug: string): Promise<PublishedPost | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("posts")
    .select("title,slug,excerpt,content,published_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedPost(params.slug);
  if (!post) return {};

  return {
    title: `${post.title} — Montano Systems`,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main>
        <article className="blog-post section">
          <div className="container blog-post-container">
            <p className="eyebrow" style={{ color: "var(--ink)" }}>
              {new Date(post.published_at).toLocaleDateString()}
            </p>
            <h1>{post.title}</h1>
            <div className="blog-post-body">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            <a href="/blog" className="about-link">
              ← Back to blog
            </a>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
