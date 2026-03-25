// lib/omr-crop.ts

export async function cropAnswerSection(base64Image: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // Header on Indian OMR sheets takes ~47% — crop it out
      const cropStartY = Math.floor(height * 0.47);
      const cropHeight = height - cropStartY;

      // Also upscale 1.5x so bubbles are larger and clearer for Gemini
      const scale = 1.5;
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(cropHeight * scale);

      ctx.drawImage(img, 0, cropStartY, width, cropHeight, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.src = base64Image;
  });
}

export function isFullSheetPhoto(base64Image: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve((img.naturalWidth / img.naturalHeight) < 0.85);
    };
    img.src = base64Image;
  });
}

// Split answer grid into 4 vertical column strips
// Returns array of 4 base64 images: [Q1-30, Q31-60, Q61-90, Q91-120]
export async function splitIntoColumns(base64Image: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const totalWidth = img.naturalWidth;
      const totalHeight = img.naturalHeight;

      // Small horizontal padding to ignore sheet edges/margins
      const leftPad = Math.floor(totalWidth * 0.01);
      const rightPad = Math.floor(totalWidth * 0.01);
      const usableWidth = totalWidth - leftPad - rightPad;

      // Each column is 25% of usable width
      const colWidth = Math.floor(usableWidth / 4);

      const columns: string[] = [];

      for (let col = 0; col < 4; col++) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        // Add slight overlap (2%) between columns to avoid cutting bubbles
        const overlap = Math.floor(colWidth * 0.02);
        const startX = leftPad + col * colWidth - (col > 0 ? overlap : 0);
        const width = colWidth + (col > 0 ? overlap : 0) + (col < 3 ? overlap : 0);

        canvas.width = width;
        canvas.height = totalHeight;

        ctx.drawImage(
          img,
          startX, 0, width, totalHeight,
          0, 0, width, totalHeight
        );

        columns.push(canvas.toDataURL("image/jpeg", 0.95));
      }

      resolve(columns);
    };
    img.src = base64Image;
  });
}