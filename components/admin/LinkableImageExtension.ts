import Image from "@tiptap/extension-image";

// Extends the standard Image node with an optional `href` (so an image can
// link somewhere — plain TipTap images have no way to be clickable) and an
// `align` attribute. Resize is the base extension's own built-in feature,
// enabled via `.configure({ resize: {...} })` at the call site — it manages
// width/height directly on the node, which this extension leaves untouched.
//
// Alignment is applied as a margin directly on the <img> itself (not a
// wrapping <div style="text-align:...">) specifically so it still shows up
// live while editing: enabling `resize` makes the base Image extension use
// its own NodeView for the editable view, which renders a bare <img> element
// and applies this node's `style`/other attributes straight onto it — but
// bypasses this extension's renderHTML entirely, so anything expressed only
// as a wrapping element around the image would work in the exported HTML
// (getHTML() always goes through renderHTML) but never appear while editing.
const LinkableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
        parseHTML: (element: HTMLElement) => element.closest("a")?.getAttribute("href") || null,
        renderHTML: () => ({}),
      },
      align: {
        default: "left",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-align") || "left",
        renderHTML: (attributes: { align?: string }) => ({ "data-align": attributes.align }),
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    // `href`'s own renderHTML returns {} (an <img> can't carry a real href
    // attribute), so — unlike `align` above — its value only ever exists on
    // node.attrs, never in HTMLAttributes here.
    const href = node.attrs.href as string | null;
    const align = (node.attrs.align as string | null) || "left";
    const marginByAlign: Record<string, string> = {
      left: "margin:0 auto 0 0;",
      center: "margin:0 auto;",
      right: "margin:0 0 0 auto;",
    };

    const imgAttrs = { ...HTMLAttributes, style: `display:block;max-width:100%;${marginByAlign[align] || marginByAlign.left}` };
    const imgTag: [string, Record<string, unknown>] = ["img", imgAttrs];

    if (href) {
      return ["a", { href, target: "_blank", rel: "noopener noreferrer", style: "display:block;" }, imgTag];
    }
    return imgTag;
  },
});

export default LinkableImage;
