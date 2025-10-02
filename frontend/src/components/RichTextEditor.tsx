'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">Loading editor...</div>
});

// Import Quill CSS
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing your manuscript...",
  className = "",
  disabled = false
}) => {
  // Custom toolbar configuration for academic writing
  const modules = {
    toolbar: [
      // Formatting
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      
      // Text alignment and lists
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      
      // Special characters and formatting
      [{ 'script': 'sub'}, { 'script': 'super' }],
      ['blockquote', 'code-block'],
      
      // Links and media
      ['link'],
      
      // Utility
      ['clean'] // Remove formatting
    ],
    clipboard: {
      // Strip most formatting when pasting
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'align', 'list', 'bullet', 'indent',
    'script', 'blockquote', 'code-block',
    'link'
  ];

  // Custom styles to match your design
  const editorStyle = {
    minHeight: '300px',
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .ql-editor {
          min-height: 300px;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-bottom: none;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
        }
        
        .ql-container {
          border-bottom: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-top: none;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          font-family: inherit;
        }
        
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        /* Academic writing styles */
        .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4 {
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }
        
        .ql-editor h1 { font-size: 1.5rem; }
        .ql-editor h2 { font-size: 1.25rem; }
        .ql-editor h3 { font-size: 1.125rem; }
        .ql-editor h4 { font-size: 1rem; }
        
        .ql-editor p {
          margin: 0.5rem 0;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .ql-editor ul, .ql-editor ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        .ql-editor li {
          margin: 0.25rem 0;
        }
        
        /* Focus styles */
        .ql-container.ql-focus {
          box-shadow: 0 0 0 2px rgb(59 130 246 / 0.5);
        }
        
        /* Toolbar button styles */
        .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        
        .ql-toolbar .ql-fill {
          fill: #374151;
        }
        
        .ql-toolbar button:hover .ql-stroke {
          stroke: #1f2937;
        }
        
        .ql-toolbar button:hover .ql-fill {
          fill: #1f2937;
        }
        
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6;
        }
        
        .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6;
        }
      `}</style>
      
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={editorStyle}
        theme="snow"
      />
    </div>
  );
};

export default RichTextEditor;