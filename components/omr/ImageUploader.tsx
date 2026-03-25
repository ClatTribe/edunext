// =============================================================
// FILE: app/omr-reader/components/ImageUploader.tsx
// Drag-and-drop + click upload with multi-image preview
// =============================================================

"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  images: string[];
  previews: string[];
  onImagesChange: (images: string[], previews: string[]) => void;
  disabled?: boolean;
}

export default function ImageUploader({
  images,
  previews,
  onImagesChange,
  disabled,
}: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages: string[] = [];
      const newPreviews: string[] = [];
      let loaded = 0;

      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newImages.push(reader.result as string);
          newPreviews.push(URL.createObjectURL(file));
          loaded++;
          if (loaded === acceptedFiles.length) {
            onImagesChange(
              [...images, ...newImages],
              [...previews, ...newPreviews]
            );
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [images, previews, onImagesChange]
  );

  const removeImage = (index: number) => {
    onImagesChange(
      images.filter((_, i) => i !== index),
      previews.filter((_, i) => i !== index)
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: true,
    disabled,
  });

  return (
    <div>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-amber-500 bg-amber-500/10"
            : disabled
              ? "border-slate-800 bg-slate-900/50 cursor-not-allowed"
              : "border-slate-700 bg-[#0F172B] hover:border-slate-500"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-4xl mb-3">{isDragActive ? "📥" : "📄"}</p>
        <p className="text-white text-lg font-semibold mb-1">
          {isDragActive ? "Drop OMR sheet(s) here..." : "Drag & drop OMR sheet image(s)"}
        </p>
        <p className="text-slate-400 text-sm">
          or click to browse — JPG, PNG, WebP supported. Multiple images for multi-page sheets.
        </p>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative group">
              <img
                src={preview}
                alt={`OMR Page ${idx + 1}`}
                className="w-28 h-36 object-cover rounded-lg border border-slate-700"
              />
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              )}
              <p className="text-xs text-slate-500 text-center mt-1">Page {idx + 1}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}