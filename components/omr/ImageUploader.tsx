"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  images: string[];
  previews: string[];
  onImagesChange: (images: string[], previews: string[]) => void;
  disabled?: boolean;
}

export default function ImageUploader({ images, previews, onImagesChange, disabled }: ImageUploaderProps) {
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const [modalIdx, setModalIdx] = useState<number>(-1);
  const [mode, setMode] = useState<"view" | "crop">("view");
  const [zoom, setZoom] = useState(1);

  // Crop state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [scale, setScale] = useState(1);

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
            onImagesChange([...images, ...newImages], [...previews, ...newPreviews]);
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

  const openModal = (idx: number) => {
    setModalSrc(images[idx]);
    setModalIdx(idx);
    setMode("view");
    setZoom(1);
    setCropRect({ x: 0, y: 0, w: 0, h: 0 });
  };

  // Init canvas when switching to crop mode
  useEffect(() => {
    if (mode !== "crop" || !modalSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current!;
      const container = canvas.parentElement!;
      const maxW = container.clientWidth - 24;
      const maxH = 420;
      const s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      setScale(s);

      // Set canvas pixel dimensions explicitly — never use CSS to resize canvas
      const w = Math.floor(img.naturalWidth * s);
      const h = Math.floor(img.naturalHeight * s);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      setCropRect({ x: 0, y: 0, w: 0, h: 0 });
    };
    img.src = modalSrc;
  }, [mode, modalSrc]);

  const redraw = (r: { x: number; y: number; w: number; h: number }) => {
    const canvas = canvasRef.current!;
    const img = imgRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (r.w > 5 && r.h > 5) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(r.x, r.y, r.w, r.h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, r.x / scale, r.y / scale, r.w / scale, r.h / scale, r.x, r.y, r.w, r.h);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      // Corner handles
      ctx.fillStyle = "#f59e0b";
      [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].forEach(([hx, hy]) => {
        ctx.fillRect(hx - 4, hy - 4, 8, 8);
      });
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const b = canvas.getBoundingClientRect();
    // Scale mouse coords to canvas pixel coords
    const scaleX = canvas.width / b.width;
    const scaleY = canvas.height / b.height;
    return {
      x: Math.max(0, Math.min((e.clientX - b.left) * scaleX, canvas.width)),
      y: Math.max(0, Math.min((e.clientY - b.top) * scaleY, canvas.height)),
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getPos(e);
    setStart(p);
    setDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const p = getPos(e);
    const r = {
      x: Math.min(start.x, p.x),
      y: Math.min(start.y, p.y),
      w: Math.abs(p.x - start.x),
      h: Math.abs(p.y - start.y),
    };
    setCropRect(r);
    redraw(r);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    setDragging(false);
    const p = getPos(e);
    const r = {
      x: Math.min(start.x, p.x),
      y: Math.min(start.y, p.y),
      w: Math.abs(p.x - start.x),
      h: Math.abs(p.y - start.y),
    };
    setCropRect(r);
    redraw(r);
  };

  const resetCrop = () => {
    setCropRect({ x: 0, y: 0, w: 0, h: 0 });
    if (imgRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imgRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const applyCrop = () => {
    if (!imgRef.current || cropRect.w < 20 || cropRect.h < 20) return;
    const img = imgRef.current;

    // Output at original image resolution
    const realX = cropRect.x / scale;
    const realY = cropRect.y / scale;
    const realW = cropRect.w / scale;
    const realH = cropRect.h / scale;

    const out = document.createElement("canvas");
    out.width = Math.floor(realW);
    out.height = Math.floor(realH);
    const ctx = out.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, realX, realY, realW, realH, 0, 0, out.width, out.height);

    const croppedBase64 = out.toDataURL("image/jpeg", 0.95);
    const newImages = images.map((img, i) => (i === modalIdx ? croppedBase64 : img));
    const newPreviews = previews.map((p, i) => (i === modalIdx ? croppedBase64 : p));
    onImagesChange(newImages, newPreviews);
    setModalSrc(null);
  };

  const hasCrop = cropRect.w > 20 && cropRect.h > 20;

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

      {/* Previews */}
      {previews.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative group">
              <div className="relative cursor-pointer" onClick={() => openModal(idx)}>
                <img
                  src={preview}
                  alt={`OMR Page ${idx + 1}`}
                  className="w-28 h-36 object-cover rounded-lg border border-slate-700 group-hover:border-amber-500/50 transition-colors"
                />
                <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <span className="text-white text-sm">🔍 View</span>
                  <span className="text-amber-400 text-xs">✂️ Crop</span>
                </div>
              </div>
              {!disabled && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-400"
                >
                  ✕
                </button>
              )}
              <p className="text-xs text-slate-500 text-center mt-1">Page {idx + 1}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6"
          onClick={() => setModalSrc(null)}
        >
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#0F172B",
              border: "1px solid rgba(245,158,11,0.3)",
              width: "min(92vw, 640px)",
              maxHeight: "88vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 flex-shrink-0">
              {/* Mode toggle */}
              <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setMode("view")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    mode === "view" ? "bg-amber-500 text-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🔍 View
                </button>
                <button
                  onClick={() => setMode("crop")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    mode === "crop" ? "bg-amber-500 text-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ✂️ Crop
                </button>
              </div>

              {/* View mode zoom controls */}
              {mode === "view" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    className="w-7 h-7 rounded-lg bg-slate-700 text-white hover:bg-slate-600 font-bold text-sm transition-colors"
                  >−</button>
                  <span className="text-slate-300 text-xs w-10 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
                    className="w-7 h-7 rounded-lg bg-slate-700 text-white hover:bg-slate-600 font-bold text-sm transition-colors"
                  >+</button>
                  <button
                    onClick={() => setZoom(1)}
                    className="text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-1 rounded-lg transition-colors"
                  >Reset</button>
                </div>
              )}

              <button
                onClick={() => setModalSrc(null)}
                className="text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                ✕
              </button>
            </div>

            {/* View Mode */}
            {mode === "view" && (
              <div className="flex-1 overflow-auto p-3">
                <img
                  src={modalSrc}
                  alt="OMR Sheet"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    transition: "transform 0.2s ease",
                    width: zoom <= 1 ? "100%" : "auto",
                    maxWidth: "none",
                  }}
                  className="rounded-lg"
                  draggable={false}
                />
              </div>
            )}

            {/* Crop Mode */}
            {mode === "crop" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 px-4 py-2 flex-shrink-0">
                  Drag on the image to select the answer bubble area
                </p>
                <div className="flex-1 overflow-auto px-3 flex items-start justify-center">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    className="rounded-lg cursor-crosshair block"
                  />
                </div>
                <div className="px-4 py-3 border-t border-slate-800 flex gap-2 flex-shrink-0">
                  <button
                    onClick={resetCrop}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-600 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyCrop}
                    disabled={!hasCrop}
                    className="flex-1 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {hasCrop ? "✓ Apply Crop" : "Drag to select answer area"}
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-slate-600 py-1.5 flex-shrink-0 border-t border-slate-800">
              {mode === "view" ? "Scroll to pan • Click outside to close" : "Drag to select • Apply to save crop"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}