import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const metadata: Metadata = {
  title: "Blog — Montano Systems",
  description: "Notes on systems, automation, and running a business on fewer tools.",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
}

export default async function BlogIndexPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("blog index fetch failed", error);
  }

  const posts = (data as PostListItem[]) ?? [];

  return (
    <>
      <Header />
      <main>
        <section className="blog-hero section">
          <div className="container">
            <p className="eyebrow" style={{ color: "var(--ink)" }}>
              From the notebook
            </p>
            <h1>Blog</h1>
          </div>
        </section>

        <section className="blog-list section">
          <div className="container">
            {posts.length === 0 ? (
              <p className="blog-empty">Nothing published yet — check back soon.</p>
            ) : (
              <div className="blog-list-grid">
                {posts.map((p) => (
                  <a key={p.id} href={`/blog/${p.slug}`} className="blog-card">
                    <span className="blog-card-date">{new Date(p.published_at).toLocaleDateString()}</span>
                    <h2>{p.title}</h2>
                    {p.excerpt && <p>{p.excerpt}</p>}
                  </a>
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
