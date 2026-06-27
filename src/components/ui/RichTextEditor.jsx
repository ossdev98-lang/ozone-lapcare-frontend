import { useState, useRef, useEffect } from 'react'
import { FiBold, FiItalic, FiLink, FiEye } from 'react-icons/fi'

export default function RichTextEditor({ label, value, onChange, height = 200 }) {
  const editorRef = useRef(null)
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    if (editorRef.current && !isPreview) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, isPreview])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command, defaultValue = null) => {
    document.execCommand(command, false, defaultValue)
    handleInput()
    editorRef.current?.focus()
  }

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://')
    if (url) execCommand('createLink', url)
  }

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[#374151] mb-1.5">{label}</label>}
      
      <div className="flex items-center gap-1 p-2 rounded-t-xl bg-white/40 border border-white/40 border-b-0">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 rounded hover:bg-white/60 transition-colors cursor-pointer"
          title="Bold"
        >
          <FiBold className="w-4 h-4 text-[#64748B]" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 rounded hover:bg-white/60 transition-colors cursor-pointer"
          title="Italic"
        >
          <FiItalic className="w-4 h-4 text-[#64748B]" />
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="p-1.5 rounded hover:bg-white/60 transition-colors cursor-pointer"
          title="Insert Link"
        >
          <FiLink className="w-4 h-4 text-[#64748B]" />
        </button>
        <div className="w-px h-5 bg-white/40 mx-1" />
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`p-1.5 rounded transition-all cursor-pointer ${isPreview ? 'bg-primary text-white' : 'hover:bg-white/60'}`}
          title={isPreview ? 'Edit' : 'Preview'}
        >
          <FiEye className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable={!isPreview}
        onInput={handleInput}
        className={`premium-input rounded-t-none overflow-y-auto text-sm p-3 outline-none ${
          isPreview ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
        style={{ minHeight: `${height}px` }}
      />
    </div>
  )
}