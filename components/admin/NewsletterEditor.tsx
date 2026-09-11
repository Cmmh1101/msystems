"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import LinkableImage from "./LinkableImageExtension";

export default function NewsletterEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: false }),
      LinkableImage.configure({
        inline: false,
        resize: {
          enabled: true,
          directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
          minWidth: 40,
          alwaysPreserveAspectRatio: true,
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "newsletter-editor-content" },
    },
  });

  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function setImageLink() {
    if (!editor) return;
    const current = editor.getAttributes("image").href as string | undefined;
    const url = window.prompt("Image link URL (leave blank to remove)", current || "https://");
    if (url === null) return;
    editor.chain().focus().updateAttributes("image", { href: url || null }).run();
  }

  function setAlign(align: "left" | "center" | "right") {
    if (!editor) return;
    // The same three buttons double as image alignment when an image is
    // selected — plain TipTap images are leaf nodes with no inline content
    // of their own for a generic text-align extension to align, so this
    // extension carries its own `align` attribute instead (see
    // LinkableImageExtension.ts).
    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { align }).run();
    } else {
      editor.chain().focus().setTextAlign(align).run();
    }
  }

  function isAlignActive(align: "left" | "center" | "right") {
    if (!editor) return false;
    if (editor.isActive("image")) return (editor.getAttributes("image").align || "left") === align;
    return editor.isActive({ textAlign: align });
  }

  function handleImageButtonClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "newsletters");

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok && json.ok) {
        editor.chain().focus().setImage({ src: json.url }).run();
      } else {
        window.alert(json.error || "Upload failed.");
      }
    } catch {
      window.alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="newsletter-editor">
      {/* Toolbar buttons would otherwise steal focus on mousedown and collapse
          the editor's text selection before the click handler ever runs. */}
      <div className="newsletter-editor-toolbar" onMouseDown={(e) => e.preventDefault()}>
        <button
          type="button"
          className={editor.isActive("bold") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={editor.isActive("italic") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={editor.isActive("underline") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </button>
        <span className="newsletter-editor-divider" />
        <button
          type="button"
          className={editor.isActive("bulletList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          className={editor.isActive("orderedList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <span className="newsletter-editor-divider" />
        <button type="button" className={isAlignActive("left") ? "active" : ""} onClick={() => setAlign("left")} title="Align left">
          ⟵
        </button>
        <button type="button" className={isAlignActive("center") ? "active" : ""} onClick={() => setAlign("center")} title="Align center">
          ↔
        </button>
        <button type="button" className={isAlignActive("right") ? "active" : ""} onClick={() => setAlign("right")} title="Align right">
          ⟶
        </button>
        <span className="newsletter-editor-divider" />
        <button type="button" className={editor.isActive("link") ? "active" : ""} onClick={setLink}>
          Link
        </button>
        <button type="button" onClick={handleImageButtonClick} disabled={uploading}>
          {uploading ? "Uploading…" : "Image"}
        </button>
        {editor.isActive("image") && (
          <button type="button" onClick={setImageLink}>
            Link image
          </button>
        )}
      </div>
      {editor.isActive("image") && (
        <p className="newsletter-editor-hint">
          Drag a corner to resize. Alignment applies to the sent email even though this preview doesn&rsquo;t shift the
          image — use &ldquo;Send test&rdquo; to see the true result.
        </p>
      )}
      <EditorContent editor={editor} />
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={handleFileChange} />
    </div>
  );
}
