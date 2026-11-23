"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Undo2, Unlink } from "lucide-react";
import { useState } from "react";
import { MediaPicker } from "./MediaPicker";

export function RichTextEditor({ value, onChange, label, id }: { value: string; onChange: (html: string) => void; label: string; id: string }) {
  const [picker, setPicker] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true, protocols: ["https", "mailto", "tel"] } }), Image],
    content: value || "",
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose-site px-4 py-3 tiptap", "aria-label": label, id, role: "textbox", "aria-multiline": "true" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor) return <div className="field min-h-[300px]" />;

  const btn = (active: boolean, onClick: () => void, title: string, Icon: React.ComponentType<{ className?: string }>) => (
    <button type="button" onClick={onClick} title={title} aria-label={title} aria-pressed={active} className={`rounded p-1.5 ${active ? "bg-navy text-white" : "text-muted hover:bg-surface hover:text-fg"}`}>
      <Icon className="h-4 w-4" />
    </button>
  );

  function setLink() {
    const prev = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://… , /page, mailto: or tel:)", prev || "https://");
    if (url === null) return;
    if (url === "") return void editor!.chain().focus().unsetLink().run();
    if (!/^(https?:\/\/|\/|mailto:|tel:)/.test(url)) return alert("Please use a full https:// URL, a /relative path, mailto: or tel:");
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
      <div className="flex flex-wrap gap-0.5 border-b border-line bg-surface p-1.5" role="toolbar" aria-label={`${label} formatting`}>
        {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "Bold", Bold)}
        {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "Italic", Italic)}
        {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Heading 2", Heading2)}
        {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Heading 3", Heading3)}
        {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "Bullet list", List)}
        {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "Numbered list", ListOrdered)}
        {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), "Quote", Quote)}
        {btn(false, () => editor.chain().focus().setHorizontalRule().run(), "Divider", Minus)}
        {btn(editor.isActive("link"), setLink, "Add link", Link2)}
        {btn(false, () => editor.chain().focus().unsetLink().run(), "Remove link", Unlink)}
        {btn(false, () => setPicker(true), "Insert image", ImagePlus)}
        <span className="mx-1 w-px bg-line" />
        {btn(false, () => editor.chain().focus().undo().run(), "Undo", Undo2)}
        {btn(false, () => editor.chain().focus().redo().run(), "Redo", Redo2)}
      </div>
      <EditorContent editor={editor} />
      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onSelect={(m) => {
            editor.chain().focus().setImage({ src: m.url, alt: m.alt }).run();
            setPicker(false);
          }}
        />
      )}
    </div>
  );
}
