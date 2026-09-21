import React, { useState, useRef } from "react";
import { Camera, X, RefreshCw } from "lucide-react";

interface VehicleImageUploadProps {
  value?: File | null;
  previewUrl?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export const VehicleImageUpload: React.FC<VehicleImageUploadProps> = ({
  previewUrl,
  onChange,
  disabled = false,
}) => {
  const [internalPreview, setInternalPreview] = useState<string | null>(previewUrl || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setInternalPreview(url);
      onChange(file);
    }
  };

  const handleRemove = () => {
    setInternalPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        Vehicle Image
      </label>

      {internalPreview ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
          <img
            src={internalPreview}
            alt="Vehicle preview"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full bg-white text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
              aria-label="Replace vehicle image"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemove}
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              aria-label="Remove vehicle image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50 rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer transition-colors px-4 text-center"
        >
          <div className="h-11 w-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs mb-2">
            <Camera className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Upload vehicle photograph</p>
          <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG or WebP (max 5MB)</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />
    </div>
  );
};