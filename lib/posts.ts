import type { Locale } from "./i18n/dictionary";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  published_at: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  title_es: string | null;
  excerpt_es: string | null;
  content_es: string | null;
}

export function localizedPost(post: Pick<Post, "title" | "excerpt" | "content" | "title_es" | "excerpt_es" | "content_es">, locale: Locale) {
  if (locale === "es" && post.title_es) {
    return {
      title: post.title_es,
      excerpt: post.excerpt_es || post.excerpt,
      content: post.content_es || post.content,
    };
  }
  return { title: post.title, excerpt: post.excerpt, content: post.content };
}
