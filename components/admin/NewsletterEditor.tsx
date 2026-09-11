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
      LinkableImage.configure({ inline: false }),
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
        <button
          type="button"
          className={editor.isActive({ textAlign: "left" }) ? "active" : ""}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align left"
        >
          ⟵
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: "center" }) ? "active" : ""}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align center"
        >
          ↔
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: "right" }) ? "active" : ""}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align right"
        >
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
      <EditorContent editor={editor} />
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={handleFileChange} />
    </div>
  );
}
