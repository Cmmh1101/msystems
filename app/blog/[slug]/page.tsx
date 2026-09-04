import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { localizedPost, type Post } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PublishedPost = Pick<
  Post,
  "title" | "slug" | "excerpt" | "content" | "published_at" | "featured_image_url" | "featured_image_alt" | "title_es" | "excerpt_es" | "content_es"
>;

async function getPublishedPost(slug: string): Promise<PublishedPost | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("posts")
    .select("title,slug,excerpt,content,published_at,featured_image_url,featured_image_alt,title_es,excerpt_es,content_es")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedPost(params.slug);
  if (!post) return {};

  const locale = getLocale();
  const localized = localizedPost(post, locale);

  return {
    title: `${localized.title} — Montano Systems`,
    description: localized.excerpt ?? undefined,
    openGraph: post.featured_image_url
      ? {
          title: localized.title,
          description: localized.excerpt ?? undefined,
          images: [{ url: post.featured_image_url }],
        }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost(params.slug);
  if (!post) notFound();

  const locale = getLocale();
  const t = getDictionary(locale).blog;
  const localized = localizedPost(post, locale);

  return (
    <>
      <Header locale={locale} />
      <main>
        <article className="blog-post section">
          <div className="container blog-post-container">
            <p className="eyebrow" style={{ color: "var(--ink)" }}>
              {new Date(post.published_at!).toLocaleDateString(locale === "es" ? "es" : "en-US")}
            </p>
            <h1>{localized.title}</h1>
            {post.featured_image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img className="blog-post-image" src={post.featured_image_url} alt={post.featured_image_alt || ""} />
            )}
            <div className="blog-post-body">
              <ReactMarkdown>{localized.content}</ReactMarkdown>
            </div>
            <a href="/blog" className="about-link">
              {t.backToBlog}
            </a>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
