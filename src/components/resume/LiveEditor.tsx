import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  Link,
  Type,
  Palette,
  Save,
  Undo,
  Redo
} from 'lucide-react';

interface LiveEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const LiveEditor: React.FC<LiveEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }
  };

  const getSelectionText = () => {
    const selection = window.getSelection();
    return selection ? selection.toString() : '';
  };

  const isCommandActive = (command: string) => {
    return document.queryCommandState(command);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      {isEditing && (
        <div className="absolute -top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center space-x-1 z-10">
          <button
            onClick={() => execCommand('bold')}
            className={`p-1 rounded hover:bg-gray-100 ${isCommandActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('italic')}
            className={`p-1 rounded hover:bg-gray-100 ${isCommandActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('underline')}
            className={`p-1 rounded hover:bg-gray-100 ${isCommandActive('underline') ? 'bg-blue-100 text-blue-600' : ''}`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button
            onClick={() => execCommand('justifyLeft')}
            className={`p-1 rounded hover:bg-gray-100 ${isCommandActive('justifyLeft') ? 'bg-blue-100 text-blue-600' : ''}`}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('justifyCenter')}
            className={`p-1 rounded hover:bg-gray-100 ${isCommandActive('justifyCenter') ? 'bg-blue-100 text-blue-600' : ''}`}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('justifyRight')}
            className={`p-1 rounded hover:bg-gray-100 ${isCommandActive('justifyRight') ? 'bg-blue-100 text-blue-600' : ''}`}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button
            onClick={() => execCommand('insertUnorderedList')}
            className={`p-1 rounded hover:bg-gray-100 ${isCommandActive('insertUnorderedList') ? 'bg-blue-100 text-blue-600' : ''}`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button
            onClick={() => execCommand('undo')}
            className="p-1 rounded hover:bg-gray-100"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('redo')}
            className="p-1 rounded hover:bg-gray-100"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`
          min-h-[2rem] p-2 border-2 border-transparent rounded transition-all duration-200 outline-none
          ${isEditing ? 'border-blue-300 bg-blue-50' : 'hover:bg-gray-50'}
          ${!content && !isEditing ? 'text-gray-400' : ''}
        `}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      />

      {/* Placeholder */}
      {!content && !isEditing && (
        <div className="absolute inset-0 p-2 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default LiveEditor;