'use client';

import { useState } from 'react';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  /** Callback with selected File(s); used to collect uploads for submit */
  onFilesChange?: (files: File[]) => void;
}

export default function FileUpload({ label, accept = '*', multiple = false, onFilesChange }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const list = Array.from(e.target.files);
      setFiles(list);
      onFilesChange?.(list);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${label.replace(/\s/g, '-')}`}
        />
        <label
          htmlFor={`file-upload-${label.replace(/\s/g, '-')}`}
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="text-4xl mb-2">📁</div>
          <p className="text-sm text-gray-600">Cliquez pour choisir ou glisser-déposer</p>
          <p className="text-xs text-gray-500 mt-1">
            {accept === 'image/*' ? 'PNG, JPG, PDF' : accept.includes('pdf') ? 'PDF, DOC, DOCX' : 'Tous types'}
          </p>
        </label>
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Fichiers sélectionnés :</p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-green-600 mr-2 font-bold">✓</span>
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
