export async function cropAnswerSection(base64Image: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const aspectRatio = width / height;

      // Crop ratio based on aspect ratio — never cut into answer grid
      // Portrait phone photos have large headers
      // Landscape/square scans have small headers
      let cropRatio: number;
      if (aspectRatio < 0.5) {
        cropRatio = 0.30; // very tall portrait — small crop
      } else if (aspectRatio < 0.7) {
        cropRatio = 0.25; // medium portrait
      } else if (aspectRatio < 0.9) {
        cropRatio = 0.20; // nearly square
      } else {
        cropRatio = 0.10; // landscape — almost no crop
      }

      const cropStartY = Math.floor(height * cropRatio);
      const cropHeight = height - cropStartY;

      // Upscale for better AI visibility
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
      // Only crop if clearly portrait (phone photo)
      resolve((img.naturalWidth / img.naturalHeight) < 0.90);
    };
    img.src = base64Image;
  });
}