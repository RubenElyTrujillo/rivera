import { useRef, useState, useCallback } from "react"
import { ImagePlus, Loader2 } from "lucide-react"

interface GalleryDropzoneProps {
  /** Called once per uploaded image with the resulting URL */
  onUploaded: (url: string) => Promise<void>
  disabled?: boolean
}

/**
 * Drop zone for gallery images.
 * Accepts multiple files via drag-and-drop or file picker.
 * Uploads each file to /api/media/upload and calls onUploaded with the URL.
 */
export function GalleryDropzone({ onUploaded, disabled = false }: GalleryDropzoneProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"))
    if (!arr.length) return

    setProgress({ done: 0, total: arr.length })
    for (let i = 0; i < arr.length; i++) {
      const form = new FormData()
      form.append("file", arr[i])
      try {
        const res = await fetch("/api/media/upload", { method: "POST", body: form })
        if (res.ok) {
          const data = await res.json() as { url: string }
          await onUploaded(data.url)
        }
      } catch {
        // silently skip failed file
      }
      setProgress({ done: i + 1, total: arr.length })
    }
    setProgress(null)
  }, [onUploaded])

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!disabled) setDragging(true)
  }
  function onDragLeave() { setDragging(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (!disabled) uploadFiles(e.dataTransfer.files)
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) uploadFiles(e.target.files)
    if (fileRef.current) fileRef.current.value = ""
  }

  const isUploading = progress !== null

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && !isUploading && fileRef.current?.click()}
      onKeyDown={e => e.key === "Enter" && !disabled && !isUploading && fileRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-sm transition-all select-none",
        disabled || isUploading
          ? "cursor-default opacity-60 border-[hsl(0,0%,80%)]"
          : dragging
            ? "cursor-copy border-[hsl(20,60%,45%)] bg-[hsl(20,60%,97%)]"
            : "cursor-pointer border-[hsl(0,0%,80%)] hover:border-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,99%)]",
      ].join(" ")}
    >
      {isUploading ? (
        <>
          <Loader2 size={28} className="animate-spin text-[hsl(20,60%,45%)]" />
          <p className="font-medium text-[hsl(0,0%,30%)]">
            Subiendo {progress!.done} de {progress!.total}…
          </p>
        </>
      ) : (
        <>
          <ImagePlus size={28} className={dragging ? "text-[hsl(20,60%,45%)]" : "text-[hsl(0,0%,55%)]"} />
          <p className={`font-medium ${dragging ? "text-[hsl(20,60%,42%)]" : "text-[hsl(0,0%,40%)]"}`}>
            {dragging ? "Suelta las imágenes aquí" : "Arrastra imágenes o haz click para seleccionar"}
          </p>
          <p className="text-xs text-[hsl(0,0%,55%)]">Puedes seleccionar varias a la vez · JPG, PNG, WebP</p>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  )
}
