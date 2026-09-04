import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { localizedPost } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export function generateMetadata(): Metadata {
  const t = getDictionary().blog;
  return {
    title: `${t.heading} — Montano Systems`,
    description: "Notes on systems, automation, and running a business on fewer tools.",
  };
}

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  title_es: string | null;
  excerpt_es: string | null;
  content_es: string | null;
  content: string;
}

export default async function BlogIndexPage() {
  const locale = getLocale();
  const t = getDictionary(locale).blog;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,title,slug,excerpt,published_at,featured_image_url,featured_image_alt,title_es,excerpt_es,content_es,content"
    )
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("blog index fetch failed", error);
  }

  const posts = (data as PostListItem[]) ?? [];

  return (
    <>
      <Header locale={locale} />
      <main>
        <section className="blog-hero section">
          <div className="container">
            <p className="eyebrow" style={{ color: "var(--ink)" }}>
              {t.eyebrow}
            </p>
            <h1>{t.heading}</h1>
          </div>
        </section>

        <section className="blog-list section">
          <div className="container">
            {posts.length === 0 ? (
              <p className="blog-empty">{t.empty}</p>
            ) : (
              <div className="blog-list-grid">
                {posts.map((p) => {
                  const localized = localizedPost(p, locale);
                  return (
                    <a key={p.id} href={`/blog/${p.slug}`} className="blog-card">
                      {p.featured_image_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img className="blog-card-image" src={p.featured_image_url} alt={p.featured_image_alt || ""} />
                      )}
                      <div className="blog-card-body">
                        <span className="blog-card-date">
                          {new Date(p.published_at).toLocaleDateString(locale === "es" ? "es" : "en-US")}
                        </span>
                        <h2>{localized.title}</h2>
                        {localized.excerpt && <p>{localized.excerpt}</p>}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
