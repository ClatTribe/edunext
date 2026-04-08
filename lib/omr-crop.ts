export async function cropAnswerSection(base64Image: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const aspectRatio = width / height;

      // ── Top crop (remove date/header bar) ────────────────────────────────
      let topCropRatio: number;
      if (aspectRatio < 0.5) {
        topCropRatio = 0.22;
      } else if (aspectRatio < 0.7) {
        topCropRatio = 0.18;
      } else if (aspectRatio < 0.9) {
        topCropRatio = 0.14;
      } else {
        topCropRatio = 0.05;
      }

      const TOP_PADDING_PX = 20;
      const cropStartY = Math.max(0, Math.floor(height * topCropRatio) - TOP_PADDING_PX);
      const cropHeight = height - cropStartY;

      // ── Left crop (remove Roll No / Phone / Category / Signature panel) ──
      // The left info panel is ~38% of width on portrait sheets,
      // ~28% on near-square sheets. We crop it out entirely.
      let leftCropRatio: number;
      if (aspectRatio < 0.5) {
        leftCropRatio = 0.32;   // very tall portrait — big left panel
      } else if (aspectRatio < 0.7) {
        leftCropRatio = 0.28;
      } else if (aspectRatio < 0.9) {
        leftCropRatio = 0.24;
      } else {
        leftCropRatio = 0.25;   // near-square / landscape
      }

      const LEFT_PADDING_PX = 8; // small buffer so Q1 column isn't clipped
      const cropStartX = Math.max(0, Math.floor(width * leftCropRatio) - LEFT_PADDING_PX);
      const cropWidth = width - cropStartX;

      // ── Scale up for AI clarity ──────────────────────────────────────────
      const scale = 2.5;
      canvas.width  = Math.floor(cropWidth  * scale);
      canvas.height = Math.floor(cropHeight * scale);

      ctx.drawImage(
        img,
        cropStartX, cropStartY,   // source x, y
        cropWidth,  cropHeight,   // source w, h
        0, 0,                     // dest x, y
        canvas.width, canvas.height  // dest w, h
      );

      // ── Contrast + threshold ─────────────────────────────────────────────
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        let adjusted = 2.0 * (grey - 128) + 128;
        adjusted = Math.max(0, Math.min(255, adjusted));
        const final = adjusted < 180 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = final;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.src = base64Image;
  });
}

export function isFullSheetPhoto(base64Image: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve((img.naturalWidth / img.naturalHeight) < 0.90);
    };
    img.src = base64Image;
  });
}
