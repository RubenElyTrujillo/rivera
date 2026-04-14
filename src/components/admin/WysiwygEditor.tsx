"use client";
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect } from "react"

interface WysiwygEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function WysiwygEditor({ value, onChange, placeholder = "Escribe aquí el contenido del producto…" }: WysiwygEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync external value changes (e.g. when loading saved content)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value ?? "")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  const btn = (active: boolean, onClick: () => void, label: string) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`px-2 py-1 text-xs rounded transition-colors ${
        active
          ? "bg-[hsl(20,60%,45%)] text-white"
          : "bg-transparent text-[hsl(0,0%,30%)] hover:bg-[hsl(0,0%,92%)]"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="border border-[hsl(0,0%,80%)] rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-[hsl(0,0%,96%)] border-b border-[hsl(0,0%,88%)]">
        {btn(editor.isActive("bold"),      () => editor.chain().focus().toggleBold().run(),      "B")}
        {btn(editor.isActive("italic"),    () => editor.chain().focus().toggleItalic().run(),    "I")}
        {btn(editor.isActive("strike"),    () => editor.chain().focus().toggleStrike().run(),    "S")}
        <div className="w-px bg-[hsl(0,0%,80%)] mx-1" />
        {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2")}
        {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3")}
        <div className="w-px bg-[hsl(0,0%,80%)] mx-1" />
        {btn(editor.isActive("bulletList"),  () => editor.chain().focus().toggleBulletList().run(),  "• Lista")}
        {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "1. Lista")}
        <div className="w-px bg-[hsl(0,0%,80%)] mx-1" />
        {btn(false, () => {
          const url = window.prompt("URL del enlace:")
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }, "Link")}
        {btn(false, () => {
          const url = window.prompt("URL de la imagen:")
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }, "Img")}
      </div>
      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[200px] p-3 bg-white focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[200px] [&_.tiptap_p.is-editor-empty:first-child::before]:text-[hsl(0,0%,65%)] [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  )
}
