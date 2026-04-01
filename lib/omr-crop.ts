export async function cropAnswerSection(base64Image: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const aspectRatio = width / height;

      let cropRatio: number;
      if (aspectRatio < 0.5) {
        cropRatio = 0.30;
      } else if (aspectRatio < 0.7) {
        cropRatio = 0.25;
      } else if (aspectRatio < 0.9) {
        cropRatio = 0.20;
      } else {
        cropRatio = 0.10;
      }

      const cropStartY = Math.floor(height * cropRatio);
      const cropHeight = height - cropStartY;

      // 2.5x upscale for blurry photos
      const scale = 2.5;
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(cropHeight * scale);

      ctx.drawImage(img, 0, cropStartY, width, cropHeight, 0, 0, canvas.width, canvas.height);

      // Aggressive contrast + threshold for blurry images
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Greyscale
        const grey = 0.299 * r + 0.587 * g + 0.114 * b;

        // 2x contrast boost
        let adjusted = 2.0 * (grey - 128) + 128;
        adjusted = Math.max(0, Math.min(255, adjusted));

        // Threshold: if dark enough → make pure black, otherwise pure white
        // This makes filled bubbles unmistakable
        const final = adjusted < 140 ? 0 : 255;

        data[i] = final;
        data[i + 1] = final;
        data[i + 2] = final;
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