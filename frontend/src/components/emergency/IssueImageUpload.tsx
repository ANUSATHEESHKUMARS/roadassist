
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface IssueImageUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export default function IssueImageUpload({
  files,
  onFilesChange,
  disabled = false,
}: IssueImageUploadProps) {
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<
    { file: File; url: string }[]
  >([]);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    setError("");

    const remainingSlots = MAX_FILES - files.length;

    if (selectedFiles.length > remainingSlots) {
      setError(`You can upload up to ${MAX_FILES} images in total.`);
      return;
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, WebP, and AVIF images are allowed.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Each image must be 5 MB or smaller.");
        return;
      }
    }

    onFilesChange([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
    setError("");
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium text-foreground">Issue images</h3>
        <p className="text-sm text-muted-foreground">
          Add photos that help explain the problem. Optional, up to five images.
        </p>
      </div>

      <label
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center transition-colors ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-muted/40"
        }`}
      >
        <span className="text-2xl" aria-hidden="true">＋</span>

        <span className="mt-2 text-sm font-medium text-foreground">
          Choose images
        </span>

        <span className="mt-1 text-xs text-muted-foreground">
          {files.length}/{MAX_FILES} selected · 5 MB maximum per image
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={disabled || files.length >= MAX_FILES}
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {previews.map(({ file, url }, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="overflow-hidden rounded-lg border border-border"
            >
              <img
                src={url}
                alt={`Issue preview ${index + 1}`}
                className="h-28 w-full object-cover"
              />

              <div className="space-y-2 p-2">
                <p className="truncate text-xs text-muted-foreground">
                  {file.name}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={disabled}
                  onClick={() => removeFile(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
