import Image from "@tiptap/extension-image";

// Extends the standard Image node with an optional `href` so an image can be
// wrapped in a link (e.g. a banner image that links to a blog post) — plain
// TipTap images have no way to carry a link themselves.
const LinkableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
        parseHTML: (element: HTMLElement) => element.closest("a")?.getAttribute("href") || null,
        renderHTML: () => ({}),
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    // `href`'s own renderHTML returns {} (an <img> can't carry a real href
    // attribute), which means it never appears in HTMLAttributes here no
    // matter what's stored — the actual value has to come from node.attrs.
    const href = node.attrs.href as string | null;
    const imgTag: [string, Record<string, unknown>] = ["img", HTMLAttributes];
    if (href) {
      return ["a", { href, target: "_blank", rel: "noopener noreferrer" }, imgTag];
    }
    return imgTag;
  },
});

export default LinkableImage;
