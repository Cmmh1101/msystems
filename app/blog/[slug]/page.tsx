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
  featured_image_url: string | null;
  featured_image_alt: string | null;
}

async function getPublishedPost(slug: string): Promise<PublishedPost | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("posts")
    .select("title,slug,excerpt,content,published_at,featured_image_url,featured_image_alt")
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
    openGraph: post.featured_image_url
      ? {
          title: post.title,
          description: post.excerpt ?? undefined,
          images: [{ url: post.featured_image_url }],
        }
      : undefined,
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
            {post.featured_image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                className="blog-post-image"
                src={post.featured_image_url}
                alt={post.featured_image_alt || ""}
              />
            )}
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
