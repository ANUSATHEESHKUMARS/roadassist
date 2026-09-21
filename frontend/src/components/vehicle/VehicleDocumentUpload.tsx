import React, { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Trash2 } from "lucide-react";

interface VehicleDocumentUploadProps {
  label: string;
  description?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export const VehicleDocumentUpload: React.FC<VehicleDocumentUploadProps> = ({
  label,
  description = "PDF or Scanned Image up to 5MB",
  onChange,
  disabled = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      setFile(selected);
      onChange(selected);
    }
  };

  const handleClear = () => {
    setFile(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label}
      </label>

      {file ? (
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Ready for upload ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-slate-400 hover:text-red-600 p-1 transition-colors"
            aria-label="Remove document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          className="border border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-4 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <UploadCloud className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Choose Certificate File</p>
              <p className="text-[11px] text-slate-500">{description}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md border border-slate-200">
            Browse
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg"
        className="hidden"
        disabled={disabled}
        onChange={handleFile}
      />
    </div>
  );
};